from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class CheckoutItem(BaseModel):
    product_id: UUID
    quantity: int = 1


class CheckoutRequest(BaseModel):
    items: list[CheckoutItem]
    currency: str = "USD"
    shipping_address: str | None = None


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    product_id: UUID
    quantity: int
    unit_price: Decimal


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    status: str
    currency: str
    total_amount: Decimal
    shipping_address: str | None = None
    items: list[OrderItemRead]
