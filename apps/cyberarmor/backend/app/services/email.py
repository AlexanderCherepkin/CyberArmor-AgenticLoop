from __future__ import annotations

import structlog

from app.core.config import settings

logger = structlog.get_logger()


def _resend_client():
    try:
        import resend
    except ImportError:  # pragma: no cover
        return None
    api_key = settings.resend_api_key
    if not api_key:
        return None
    resend.api_key = api_key
    return resend


def _frontend_url(path: str = "") -> str:
    base = settings.frontend_url.rstrip("/")
    return f"{base}{path}"


def send_email(to: str, subject: str, html: str, text: str | None = None) -> dict | None:
    client = _resend_client()
    params = {
        "from": settings.email_from,
        "to": to,
        "subject": subject,
        "html": html,
    }
    if text:
        params["text"] = text

    if client is None:
        logger.info("email_queued", to=to, subject=subject)
        return {"id": "queued", "queued": True}

    try:
        response = client.Emails.send(params)
        logger.info("email_sent", to=to, subject=subject, email_id=getattr(response, "id", None))
        return response
    except Exception as exc:
        logger.error("email_send_failed", to=to, subject=subject, error=str(exc))
        raise


def send_password_reset_email(to: str, token: str, locale: str = "en") -> dict | None:
    link = _frontend_url(f"/en/account/reset-password/confirm?token={token}")
    subject = "Reset your CyberArmor password"
    if locale == "ru":
        subject = "Сброс пароля CyberArmor"

    html = f"""
    <p>Click the link below to reset your password. This link expires in {settings.password_reset_token_expire_hours} hours.</p>
    <p><a href="{link}">{link}</a></p>
    <p>If you did not request this, ignore this email.</p>
    """
    text = f"""
Reset your CyberArmor password:
{link}

This link expires in {settings.password_reset_token_expire_hours} hours.
If you did not request this, ignore this email.
    """.strip()
    return send_email(to, subject, html, text)


def send_order_confirmation_email(
    to: str,
    order_id: str,
    total_cents: int,
    currency: str,
    items: list[dict],
    locale: str = "en",
) -> dict | None:
    subject = f"Order confirmation #{order_id[:8]}"
    if locale == "ru":
        subject = f"Подтверждение заказа #{order_id[:8]}"

    total_dollars = f"${total_cents / 100:.2f}"
    items_html = "".join(
        f"<li>{item.get('quantity')} × {item.get('name')} @ ${item.get('unit_price_cents', 0) / 100:.2f}</li>"
        for item in items
    )

    html = f"""
    <h1>Thank you for your order</h1>
    <p>Order ID: {order_id}</p>
    <p>Total: {total_dollars} {currency}</p>
    <ul>{items_html}</ul>
    <p>You will receive a shipping notification once your order is processed.</p>
    """
    text = f"""
Thank you for your order.

Order ID: {order_id}
Total: {total_dollars} {currency}

Items:
{items_html}

You will receive a shipping notification once your order is processed.
    """.strip()
    return send_email(to, subject, html, text)
