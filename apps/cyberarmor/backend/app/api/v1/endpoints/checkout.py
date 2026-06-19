from uuid import UUID
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.product import Product
from app.models.order import Order, OrderItem, OrderStatus
from app.schemas.order import CheckoutRequest, OrderRead

router = APIRouter()


@router.post("", response_model=OrderRead, status_code=201)
async def create_checkout(payload: CheckoutRequest, db: AsyncSession = Depends(get_db)):
    product_ids = [item.product_id for item in payload.items]
    result = await db.execute(select(Product).where(Product.id.in_(product_ids)))
    products = {p.id: p for p in result.scalars().all()}

    total = Decimal("0.00")
    order_items = []

    for item in payload.items:
        product = products.get(item.product_id)
        if product is None:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} not found")
        if product.stock_quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")

        line_total = product.price * Decimal(item.quantity)
        total += line_total
        order_items.append(
            OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                unit_price=product.price,
            )
        )
        product.stock_quantity -= item.quantity

    order = Order(
        status=OrderStatus.PENDING,
        currency=payload.currency,
        total_amount=total,
        shipping_address=payload.shipping_address,
        items=order_items,
    )

    db.add(order)
    await db.commit()
    await db.refresh(order)

    # TODO: Stripe / crypto payment intent creation goes here.
    # Keys are never stored; only metadata (order_id, amount, currency) is sent to PSPs.

    return order
