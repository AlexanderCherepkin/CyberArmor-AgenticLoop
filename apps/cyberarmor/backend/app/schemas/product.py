from uuid import UUID
from pydantic import BaseModel, ConfigDict


class ProductBase(BaseModel):
    sku: str
    name: str
    slug: str
    description: str | None = None
    price_cents: int
    currency: str = "USD"
    stock_quantity: int = 0
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductRead(ProductBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
