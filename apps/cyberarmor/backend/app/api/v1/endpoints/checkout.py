from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_active_user
from app.db.session import get_db
from app.models.order import (
    Order,
    OrderItem,
    OrderStatus,
    PromoCode,
    ShippingAddress,
    ShippingMethod,
)
from app.models.product import Product
from app.models.user import User
from app.schemas.order import (
    CartTotals,
    CheckoutItem,
    CheckoutRequest,
    OrderRead,
    PromoValidateRequest,
    PromoValidateResponse,
)

router = APIRouter()


def _total_quantity(items: list[CheckoutItem]) -> int:
    return sum(item.quantity for item in items)


def _bulk_discount_percent(quantity: int) -> int:
    if quantity >= 50:
        return 15
    if quantity >= 10:
        return 10
    if quantity >= 2:
        return 5
    return 0


def _calculate_totals(
    items: list[tuple[Product, int]],
    shipping_method: str,
    promo_code: PromoCode | None,
    is_b2b: bool,
) -> dict[str, int]:
    quantity = sum(qty for _, qty in items)
    subtotal_cents = sum(product.price_cents * qty for product, qty in items)

    bulk_percent = _bulk_discount_percent(quantity)
    bulk_discount_cents = (subtotal_cents * bulk_percent) // 100

    promo_discount_cents = 0
    if promo_code is not None and quantity >= promo_code.min_quantity:
        if promo_code.applies_to_b2b_only and not is_b2b:
            pass
        else:
            if promo_code.discount_percent:
                promo_discount_cents = (subtotal_cents * promo_code.discount_percent) // 100
            elif promo_code.discount_amount_cents:
                promo_discount_cents = min(promo_code.discount_amount_cents, subtotal_cents)

    discount_cents = max(bulk_discount_cents, promo_discount_cents)
    tax_cents = 0
    shipping_cents = ShippingMethod.COSTS.get(shipping_method, ShippingMethod.COSTS[ShippingMethod.STANDARD])
    total_cents = subtotal_cents - discount_cents + tax_cents + shipping_cents

    return {
        "subtotal_cents": subtotal_cents,
        "discount_cents": discount_cents,
        "tax_cents": tax_cents,
        "shipping_cents": shipping_cents,
        "total_cents": total_cents,
    }


async def _resolve_promo(
    db: AsyncSession,
    code: str | None,
    item_count: int,
    is_b2b: bool,
) -> PromoCode | None:
    if not code:
        return None
    result = await db.execute(select(PromoCode).where(PromoCode.code == code.upper()))
    promo = result.scalar_one_or_none()
    if promo is None:
        raise HTTPException(status_code=400, detail="Invalid promo code")
    if promo.expires_at and promo.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Promo code expired")
    if promo.max_uses is not None and promo.uses_count >= promo.max_uses:
        raise HTTPException(status_code=400, detail="Promo code usage limit reached")
    if item_count < promo.min_quantity:
        raise HTTPException(status_code=400, detail=f"Minimum {promo.min_quantity} items required")
    if promo.applies_to_b2b_only and not is_b2b:
        raise HTTPException(status_code=400, detail="Promo code requires B2B account")
    return promo


@router.post("/calculate", response_model=CartTotals)
async def calculate_cart(
    payload: CheckoutRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    product_ids = [item.product_id for item in payload.items]
    result = await db.execute(select(Product).where(Product.id.in_(product_ids)))
    products = {p.id: p for p in result.scalars().all()}

    resolved: list[tuple[Product, int]] = []
    for item in payload.items:
        product = products.get(item.product_id)
        if product is None:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} not found")
        resolved.append((product, item.quantity))

    is_b2b = any(ra.role.name == "b2b_admin" for ra in current_user.role_assignments)
    promo = await _resolve_promo(db, payload.promo_code, _total_quantity(payload.items), is_b2b)
    totals = _calculate_totals(resolved, payload.shipping_method, promo, is_b2b)
    return CartTotals(promo_code_id=promo.id if promo else None, **totals)


@router.post("/validate-promo", response_model=PromoValidateResponse)
async def validate_promo(
    payload: PromoValidateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    is_b2b = any(ra.role.name == "b2b_admin" for ra in current_user.role_assignments)
    result = await db.execute(select(PromoCode).where(PromoCode.code == payload.code.upper()))
    promo = result.scalar_one_or_none()
    if promo is None:
        return PromoValidateResponse(code=payload.code, valid=False, reason="Invalid promo code")
    if promo.expires_at and promo.expires_at < datetime.now(timezone.utc):
        return PromoValidateResponse(code=payload.code, valid=False, reason="Expired")
    if payload.item_count < promo.min_quantity:
        return PromoValidateResponse(code=payload.code, valid=False, reason="Minimum quantity not met")
    if promo.applies_to_b2b_only and not is_b2b:
        return PromoValidateResponse(code=payload.code, valid=False, reason="B2B only")
    return PromoValidateResponse(
        code=payload.code,
        discount_percent=promo.discount_percent,
        discount_amount_cents=promo.discount_amount_cents,
        valid=True,
    )


@router.post("", response_model=OrderRead, status_code=201)
async def create_checkout(
    payload: CheckoutRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    product_ids = [item.product_id for item in payload.items]
    result = await db.execute(select(Product).where(Product.id.in_(product_ids)))
    products = {p.id: p for p in result.scalars().all()}

    resolved: list[tuple[Product, int]] = []
    for item in payload.items:
        product = products.get(item.product_id)
        if product is None:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} not found")
        if product.stock_quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
        resolved.append((product, item.quantity))
        product.stock_quantity -= item.quantity

    is_b2b = any(ra.role.name == "b2b_admin" for ra in current_user.role_assignments)
    promo = await _resolve_promo(db, payload.promo_code, _total_quantity(payload.items), is_b2b)
    if promo:
        promo.uses_count += 1

    totals = _calculate_totals(resolved, payload.shipping_method, promo, is_b2b)

    order_items = [
        OrderItem(
            product_id=product.id,
            quantity=qty,
            unit_price_cents=product.price_cents,
        )
        for product, qty in resolved
    ]

    shipping = ShippingAddress(
        recipient_name=payload.shipping_address.recipient_name,
        line_1=payload.shipping_address.line_1,
        line_2=payload.shipping_address.line_2,
        city=payload.shipping_address.city,
        postal_code=payload.shipping_address.postal_code,
        country=payload.shipping_address.country.upper(),
    )

    order = Order(
        user_id=current_user.id,
        promo_code_id=promo.id if promo else None,
        status=OrderStatus.PENDING,
        currency=payload.currency,
        subtotal_cents=totals["subtotal_cents"],
        discount_cents=totals["discount_cents"],
        tax_cents=totals["tax_cents"],
        shipping_cents=totals["shipping_cents"],
        shipping_method=payload.shipping_method,
        total_cents=totals["total_cents"],
        items=order_items,
        shipping_address=shipping,
    )

    db.add(order)
    await db.commit()
    await db.refresh(order)

    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.items),
            selectinload(Order.shipping_address),
            selectinload(Order.payment),
            selectinload(Order.promo_code),
        )
        .where(Order.id == order.id)
    )
    return result.scalar_one()


@router.get("/orders", response_model=list[OrderRead])
async def list_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.items),
            selectinload(Order.shipping_address),
            selectinload(Order.payment),
            selectinload(Order.promo_code),
        )
        .where(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
    )
    return result.scalars().all()


@router.get("/orders/{order_id}", response_model=OrderRead)
async def get_order(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.items),
            selectinload(Order.shipping_address),
            selectinload(Order.payment),
            selectinload(Order.promo_code),
        )
        .where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
