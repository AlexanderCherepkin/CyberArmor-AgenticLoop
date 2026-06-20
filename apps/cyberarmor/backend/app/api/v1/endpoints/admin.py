from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.order import Order, OrderStatus, ShippingAddress
from app.models.user import User
from app.schemas.order import OrderRead, StatusUpdateRequest

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    role_names = {ra.role.name for ra in current_user.role_assignments}
    if not current_user.is_superuser and "b2b_admin" not in role_names:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


@router.patch("/orders/{order_id}/status", response_model=OrderRead)
async def update_order_status(
    order_id: UUID,
    payload: StatusUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if payload.status not in OrderStatus.ALL:
        raise HTTPException(status_code=400, detail="Invalid status")

    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.items),
            selectinload(Order.shipping_address),
            selectinload(Order.payment),
        )
        .where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    # Enforce workflow direction
    allowed_transitions = {
        OrderStatus.PAID: [OrderStatus.PROCESSING],
        OrderStatus.PROCESSING: [OrderStatus.SHIPPED],
        OrderStatus.SHIPPED: [OrderStatus.DELIVERED],
    }

    if order.status != payload.status and payload.status not in allowed_transitions.get(order.status, []):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition from {order.status} to {payload.status}",
        )

    order.status = payload.status
    if payload.status == OrderStatus.DELIVERED and order.shipping_address:
        order.shipping_address.fulfillment_date = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(order)
    return order
