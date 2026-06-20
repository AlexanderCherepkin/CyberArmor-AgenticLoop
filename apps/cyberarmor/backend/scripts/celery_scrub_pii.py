"""Placeholder Celery beat task for PII scrubbing.

Real implementation requires celery + celery[redis] in requirements and a worker
service in docker-compose. This script documents the expected logic and can be
run manually for verification.

"""
import asyncio
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import AsyncSessionLocal
from app.models.order import OrderStatus, ShippingAddress


async def scrub_fulfilled_addresses(session: AsyncSession) -> int:
    """Mark shipping addresses as scrubbed 30 days after fulfillment."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=30)
    result = await session.execute(
        select(ShippingAddress)
        .join(ShippingAddress.order)
        .where(
            ShippingAddress.is_scrubbed.is_(False),
            ShippingAddress.fulfillment_date.isnot(None),
            ShippingAddress.fulfillment_date <= cutoff,
        )
    )
    addresses = result.scalars().all()
    count = 0
    for address in addresses:
        # Hard-delete PII fields; keep the row for referential integrity.
        address.recipient_name = "[REDACTED]"
        address.line_1 = "[REDACTED]"
        address.line_2 = None
        address.city = "[REDACTED]"
        address.postal_code = "[REDACTED]"
        address.country = "XX"
        address.is_scrubbed = True
        count += 1
    await session.commit()
    return count


async def main() -> None:
    async with AsyncSessionLocal() as session:
        scrubbed = await scrub_fulfilled_addresses(session)
        print(f"Scrubbed {scrubbed} shipping addresses")


if __name__ == "__main__":
    asyncio.run(main())
