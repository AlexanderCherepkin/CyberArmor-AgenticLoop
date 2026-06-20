import asyncio
from datetime import datetime, timedelta, timezone
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.order import PromoCode


PROMO_CODES = [
    {
        "code": "EARLY10",
        "discount_percent": 10,
        "min_quantity": 1,
        "max_uses": None,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=365),
        "applies_to_b2b_only": False,
    },
    {
        "code": "B2B15",
        "discount_percent": 15,
        "min_quantity": 1,
        "max_uses": None,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=365),
        "applies_to_b2b_only": True,
    },
    {
        "code": "BULK10",
        "discount_percent": 10,
        "min_quantity": 2,
        "max_uses": None,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=365),
        "applies_to_b2b_only": False,
    },
]


async def seed():
    async with AsyncSessionLocal() as session:
        for data in PROMO_CODES:
            result = await session.execute(select(PromoCode).where(PromoCode.code == data["code"]))
            if result.scalar_one_or_none() is None:
                session.add(PromoCode(**data))
        await session.commit()
        print("Promo codes seeded.")


if __name__ == "__main__":
    asyncio.run(seed())
