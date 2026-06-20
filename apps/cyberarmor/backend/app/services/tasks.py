from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone

import structlog
from sqlalchemy import select

from app.core.celery_app import celery_app
from app.db.session import AsyncSessionLocal
from app.models.order import Order, ShippingAddress
from app.services.email import (
    send_order_confirmation_email,
    send_password_reset_email,
)

logger = structlog.get_logger()


def _now() -> datetime:
    return datetime.now(timezone.utc)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_password_reset_email_task(self, to: str, token: str, locale: str = "en") -> dict | None:
    try:
        return send_password_reset_email(to, token, locale)
    except Exception as exc:
        logger.error("send_password_reset_failed", error=str(exc))
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_order_confirmation_email_task(
    self,
    to: str,
    order_id: str,
    total_cents: int,
    currency: str,
    items: list[dict],
    locale: str = "en",
) -> dict | None:
    try:
        return send_order_confirmation_email(to, order_id, total_cents, currency, items, locale)
    except Exception as exc:
        logger.error("send_order_confirmation_failed", error=str(exc))
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=300)
def scrub_pii_after_fulfillment(self) -> int:
    """Scrub shipping addresses 30 days after fulfillment_date."""
    cutoff = _now() - timedelta(days=30)

    async def _run() -> int:
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(ShippingAddress)
                .join(Order, Order.id == ShippingAddress.order_id)
                .where(
                    Order.fulfillment_date.isnot(None),
                    Order.fulfillment_date <= cutoff,
                    ShippingAddress.line_1.isnot(None),
                    ShippingAddress.is_scrubbed.is_(False),
                )
            )
            addresses = result.scalars().all()
            scrubbed = 0
            for address in addresses:
                address.recipient_name = None
                address.line_1 = None
                address.line_2 = None
                address.city = None
                address.postal_code = None
                address.country = None
                address.is_scrubbed = True
                scrubbed += 1
            await db.commit()
            logger.info("pii_scrub_completed", scrubbed=scrubbed, cutoff=cutoff.isoformat())
            return scrubbed

    return asyncio.run(_run())
