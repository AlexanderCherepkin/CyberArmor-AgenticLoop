import json
from typing import Any

import httpx
import structlog

from app.core.config import settings

logger = structlog.get_logger()


def _hubspot_payload(rfq: Any) -> dict[str, Any]:
    return {
        "properties": {
            "email": rfq.contact_email,
            "company": rfq.company_name,
            "firstname": rfq.first_name,
            "lastname": rfq.last_name,
            "phone": rfq.phone,
            "hs_lead_status": "NEW",
            "cyberarmor_seats_min": rfq.seats_min,
            "cyberarmor_seats_max": rfq.seats_max,
            "cyberarmor_infrastructure": rfq.infrastructure,
            "cyberarmor_compliance": rfq.compliance_frameworks,
            "cyberarmor_use_case": rfq.use_case,
            "cyberarmor_timeline": rfq.timeline,
            "cyberarmor_urgency_score": rfq.urgency_score,
        }
    }


def _salesforce_payload(rfq: Any) -> dict[str, Any]:
    return {
        "Name": f"{rfq.company_name or 'Unknown'} — {rfq.seats_min} seats" if rfq.company_name else f"RFQ {rfq.id.hex[:8]}",
        "StageName": "Prospecting",
        "LeadSource": "Web RFQ",
        "Description": rfq.use_case,
        "Amount": rfq.urgency_score,
    }


async def dispatch_crm_webhook(rfq: Any) -> dict[str, Any]:
    """Dispatch RFQ lead to configured CRM webhook endpoints. Returns status per CRM."""
    crm_statuses = {}
    crm_payloads = {}

    if settings.hubspot_api_key:
        crm_payloads["hubspot"] = _hubspot_payload(rfq)
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    "https://api.hubapi.com/crm/v3/objects/contacts",
                    headers={
                        "Authorization": f"Bearer {settings.hubspot_api_key}",
                        "Content-Type": "application/json",
                    },
                    json=crm_payloads["hubspot"],
                )
                response.raise_for_status()
            crm_statuses["hubspot"] = "ok"
            logger.info("hubspot_rfq_sent", rfq_id=str(rfq.id))
        except Exception as exc:
            crm_statuses["hubspot"] = "failed"
            logger.error("hubspot_rfq_failed", rfq_id=str(rfq.id), error=str(exc))

    if settings.salesforce_webhook_url:
        crm_payloads["salesforce"] = _salesforce_payload(rfq)
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    settings.salesforce_webhook_url,
                    headers={"Content-Type": "application/json"},
                    json=crm_payloads["salesforce"],
                )
                response.raise_for_status()
            crm_statuses["salesforce"] = "ok"
            logger.info("salesforce_rfq_sent", rfq_id=str(rfq.id))
        except Exception as exc:
            crm_statuses["salesforce"] = "failed"
            logger.error("salesforce_rfq_failed", rfq_id=str(rfq.id), error=str(exc))

    if not crm_payloads:
        logger.info("crm_not_configured", rfq_id=str(rfq.id))
        crm_statuses["placeholder"] = "queued"
        crm_payloads["placeholder"] = {
            "email": rfq.contact_email,
            "company": rfq.company_name,
            "seats": rfq.seats_min,
            "infrastructure": rfq.infrastructure,
            "compliance": rfq.compliance_frameworks,
            "urgency": rfq.urgency_score,
        }

    return {
        "status": crm_statuses,
        "payloads": crm_payloads,
        "serialized": json.dumps(crm_payloads, default=str),
    }
