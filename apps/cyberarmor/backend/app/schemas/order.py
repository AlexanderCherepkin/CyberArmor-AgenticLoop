from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class CheckoutItem(BaseModel):
    product_id: UUID
    quantity: int = 1


class ShippingAddressPayload(BaseModel):
    recipient_name: str = Field(min_length=1, max_length=255)
    line_1: str = Field(min_length=1, max_length=255)
    line_2: str | None = Field(default=None, max_length=255)
    city: str = Field(min_length=1, max_length=128)
    postal_code: str = Field(min_length=1, max_length=32)
    country: str = Field(min_length=2, max_length=2)


class CheckoutRequest(BaseModel):
    items: list[CheckoutItem]
    currency: str = "USD"
    shipping_address: ShippingAddressPayload
    shipping_method: str = "standard"
    promo_code: str | None = None


class PromoCodeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    code: str
    discount_percent: int | None
    discount_amount_cents: int | None
    min_quantity: int


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    product_id: UUID
    quantity: int
    unit_price_cents: int


class ShippingAddressRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    recipient_name: str
    line_1: str
    line_2: str | None
    city: str
    postal_code: str
    country: str
    fulfillment_date: datetime | None
    is_scrubbed: bool


class PaymentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    provider: str
    status: str
    amount_cents: int
    currency: str
    provider_tx_id: str | None


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    status: str
    currency: str
    subtotal_cents: int
    discount_cents: int
    tax_cents: int
    shipping_cents: int
    total_cents: int
    shipping_method: str
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemRead]
    payment: PaymentRead | None
    shipping_address: ShippingAddressRead | None
    promo_code: PromoCodeRead | None


class CartTotals(BaseModel):
    subtotal_cents: int
    discount_cents: int
    tax_cents: int
    shipping_cents: int
    total_cents: int
    promo_code_id: UUID | None


class PromoValidateRequest(BaseModel):
    code: str = Field(min_length=1, max_length=32)
    item_count: int = Field(ge=0)


class PromoValidateResponse(BaseModel):
    code: str
    discount_percent: int | None
    discount_amount_cents: int | None
    valid: bool
    reason: str | None = None


class StatusUpdateRequest(BaseModel):
    status: str
