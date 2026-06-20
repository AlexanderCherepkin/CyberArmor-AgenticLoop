import asyncio
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.product import Product


PRODUCTS = [
    {
        "sku": "SK-STD-A",
        "name": "SecureKey Standard",
        "slug": "securekey-standard",
        "description": "USB-A security token with AES-256-XTS and PIN protection.",
        "price_cents": 14900,
        "currency": "USD",
        "stock_quantity": 1000,
    },
    {
        "sku": "SK-PRO-C",
        "name": "SecureKey Pro",
        "slug": "securekey-pro",
        "description": "USB-C token with biometric scanner and EAL6+ secure element.",
        "price_cents": 24900,
        "currency": "USD",
        "stock_quantity": 500,
    },
    {
        "sku": "SK-ENT-C",
        "name": "SecureKey Enterprise",
        "slug": "securekey-enterprise",
        "description": "Ruggedized titanium body with AD/LDAP management support.",
        "price_cents": 39900,
        "currency": "USD",
        "stock_quantity": 250,
    },
    # Upsell SKUs
    {
        "sku": "SK-CASE-AL",
        "name": "SecureKey Aluminum Case",
        "slug": "securekey-case",
        "description": "Space-grade aluminum travel case with foam insert.",
        "price_cents": 2900,
        "currency": "USD",
        "stock_quantity": 2000,
    },
    {
        "sku": "SK-SPARE-STD",
        "name": "SecureKey Spare Standard",
        "slug": "securekey-spare",
        "description": "Secondary fallback key for multi-location deployments.",
        "price_cents": 9900,
        "currency": "USD",
        "stock_quantity": 1000,
    },
]


async def seed():
    async with AsyncSessionLocal() as session:
        for data in PRODUCTS:
            result = await session.execute(select(Product).where(Product.sku == data["sku"]))
            if result.scalar_one_or_none() is None:
                session.add(Product(**data))
        await session.commit()
        print("Products seeded.")


if __name__ == "__main__":
    asyncio.run(seed())
