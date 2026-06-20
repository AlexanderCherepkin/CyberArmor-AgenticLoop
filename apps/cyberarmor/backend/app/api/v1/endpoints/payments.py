import uuid
from typing import Any

import stripe
from fastapi import APIRouter, Body, Depends, Header, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_active_user
from app.core.config import settings
from app.db.session import get_db
from app.models.order import Order, OrderItem, OrderStatus, Payment, PaymentProvider, PaymentStatus
from app.models.user import User
from app.services.tasks import send_order_confirmation_email_task

router = APIRouter()

stripe.api_key = settings.stripe_secret_key or "sk_test_placeholder"


@router.post("/orders/{order_id}/payment-intent", response_model=dict[str, str])
async def create_payment_intent(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != OrderStatus.PENDING:
        raise HTTPException(status_code=400, detail="Order is not payable")

    if not settings.stripe_secret_key or "placeholder" in settings.stripe_secret_key:
        return {"client_secret": "pi_mock_secret", "public_key": "pk_test_mock"}

    try:
        intent = stripe.PaymentIntent.create(
            amount=order.total_cents,
            currency=order.currency.lower(),
            metadata={"order_id": str(order.id), "user_id": str(current_user.id)},
            automatic_payment_methods={"enabled": True},
        )

        payment = Payment(
            order_id=order.id,
            user_id=current_user.id,
            provider=PaymentProvider.STRIPE,
            provider_tx_id=intent.id,
            amount_cents=order.total_cents,
            currency=order.currency,
            status=PaymentStatus.PENDING,
        )
        db.add(payment)
        await db.commit()

        return {"client_secret": intent.client_secret, "public_key": settings.stripe_publishable_key or "pk_test_to_configure"}
    except stripe.error.StripeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/orders/{order_id}/crypto", response_model=dict[str, str])
async def create_crypto_invoice(
    order_id: uuid.UUID,
    payload: dict[str, str] = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    currency = (payload.get("currency") or "BTC").upper()
    if currency not in {"BTC", "XMR"}:
        raise HTTPException(status_code=400, detail="Unsupported cryptocurrency")

    result = await db.execute(
        select(Order)
        .where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != OrderStatus.PENDING:
        raise HTTPException(status_code=400, detail="Order is not payable")

    mock_invoice_id = f"btcpay_mock_{uuid.uuid4().hex[:12]}"

    payment = Payment(
        order_id=order.id,
        user_id=current_user.id,
        provider=PaymentProvider.CRYPTO,
        provider_tx_id=mock_invoice_id,
        amount_cents=order.total_cents,
        currency=order.currency,
        status=PaymentStatus.PENDING,
        metadata={"crypto_currency": currency},
    )
    db.add(payment)
    await db.commit()

    return {
        "invoice_id": mock_invoice_id,
        "checkout_url": f"/crypto-checkout/{mock_invoice_id}",
        "currency": currency,
    }


@router.post("/webhooks/stripe", status_code=status.HTTP_204_NO_CONTENT)
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    stripe_signature: str | None = Header(default=None, alias="stripe-signature"),
) -> None:
    if not settings.stripe_webhook_secret:
        raise HTTPException(status_code=400, detail="Stripe webhook secret not configured")

    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature or "", settings.stripe_webhook_secret
        )
    except (ValueError, stripe.error.SignatureVerificationError) as exc:
        raise HTTPException(status_code=400, detail="Invalid signature") from exc

    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        order_id_str = intent.get("metadata", {}).get("order_id")
        if not order_id_str:
            raise HTTPException(status_code=400, detail="Missing order_id in metadata")

        result = await db.execute(
            select(Order)
            .options(
                selectinload(Order.payment),
                selectinload(Order.items).selectinload(OrderItem.product),
                selectinload(Order.user),
            )
            .where(Order.id == uuid.UUID(order_id_str))
        )
        order = result.scalar_one_or_none()
        if order is None:
            raise HTTPException(status_code=404, detail="Order not found")

        order.status = OrderStatus.PAID
        if order.payment:
            order.payment.status = PaymentStatus.SUCCEEDED
            order.payment.provider_tx_id = intent.get("id")
            order.payment.metadata = {
                **(order.payment.metadata or {}),
                "receipt_url": intent.get("charges", {}).get("data", [{}])[0].get("receipt_url"),
            }
        await db.commit()

        items = [
            {
                "name": item.product.name if item.product else "Product",
                "quantity": item.quantity,
                "unit_price_cents": item.unit_price_cents,
            }
            for item in order.items
        ]
        send_order_confirmation_email_task.delay(
            to=order.user.email,
            order_id=str(order.id),
            total_cents=order.total_cents,
            currency=order.currency,
            items=items,
            locale="en",
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/webhooks/btcpay", status_code=status.HTTP_204_NO_CONTENT)
async def btcpay_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    x_btcpay_sig: str | None = Header(default=None, alias="x-btcpay-sig"),
    x_internal_token: str | None = Header(default=None, alias="x-internal-token"),
) -> None:
    # Placeholder: real BTCPay uses HMAC-SHA256 of payload with store webhook secret.
    # For MVP we guard with an internal token to prevent open endpoint abuse.
    if not x_internal_token:
        raise HTTPException(status_code=401, detail="Missing internal token")

    body = await request.json()
    invoice_id = body.get("invoiceId")
    if not invoice_id:
        raise HTTPException(status_code=400, detail="Missing invoiceId")

    result = await db.execute(
        select(Order)
        .join(Payment, Payment.order_id == Order.id)
        .options(selectinload(Order.payment))
        .where(Payment.provider_tx_id == invoice_id)
    )
    order = result.scalar_one_or_none()
    if order is None or order.payment is None:
        raise HTTPException(status_code=404, detail="Order not found")

    status_value = body.get("status", "invalid").lower()
    if status_value in {"settled", "confirmed", "complete"}:
        order.status = OrderStatus.PAID
        order.payment.status = PaymentStatus.SUCCEEDED
        order.payment.metadata = {
            **(order.payment.metadata or {}),
            "btcpay_status": status_value,
        }
        await db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
