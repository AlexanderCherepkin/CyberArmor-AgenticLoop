import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_active_user
from app.core.config import settings
from app.crud.user import user as user_crud
from app.db.session import get_db
from app.models.rfq import RFQRequest
from app.models.user import User
from app.schemas.rfq import RFQCreate, RFQRead, RFQStatusUpdate
from app.services.crm import dispatch_crm_webhook

router = APIRouter()


def _urgency_score(payload: RFQCreate) -> int:
    score = 0
    if payload.seats_min:
        if payload.seats_min >= 1000:
            score += 50
        elif payload.seats_min >= 100:
            score += 30
        elif payload.seats_min >= 10:
            score += 10
    if payload.timeline == "asap":
        score += 30
    elif payload.timeline == "1-3-months":
        score += 15
    if payload.infrastructure == "air-gapped":
        score += 15
    if payload.compliance_frameworks:
        score += min(len(payload.compliance_frameworks) * 5, 20)
    return min(score, 100)


@router.post("", response_model=RFQRead, status_code=status.HTTP_201_CREATED)
async def submit_rfq(
    request: Request,
    payload: RFQCreate,
    db: AsyncSession = Depends(get_db),
) -> RFQRequest:
    rfq = RFQRequest(
        contact_email=payload.contact_email.lower(),
        company_name=payload.company_name,
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone=payload.phone,
        seats_min=payload.seats_min,
        seats_max=payload.seats_max,
        infrastructure=payload.infrastructure,
        compliance_frameworks=(
            ",".join(payload.compliance_frameworks) if payload.compliance_frameworks else None
        ),
        use_case=payload.use_case,
        timeline=payload.timeline,
        urgency_score=_urgency_score(payload),
        status="new",
    )
    db.add(rfq)
    await db.flush()

    crm_result = await dispatch_crm_webhook(rfq)
    rfq.crm_status = ",".join(f"{k}={v}" for k, v in crm_result["status"].items())
    rfq.crm_payload = crm_result["serialized"]

    await db.commit()
    await db.refresh(rfq)
    return rfq


@router.get("/admin/rfqs", response_model=list[RFQRead])
async def list_rfqs(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> list[RFQRequest]:
    is_admin = current_user.is_superuser or any(
        ra.role.name == "b2b_admin" for ra in current_user.role_assignments
    )
    if not is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    result = await db.execute(select(RFQRequest).order_by(RFQRequest.created_at.desc()))
    return list(result.scalars().all())


@router.patch("/admin/rfqs/{rfq_id}", response_model=RFQRead)
async def update_rfq_status(
    request: Request,
    rfq_id: uuid.UUID,
    payload: RFQStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> RFQRequest:
    is_admin = current_user.is_superuser or any(
        ra.role.name == "b2b_admin" for ra in current_user.role_assignments
    )
    if not is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    rfq = await db.get(RFQRequest, rfq_id)
    if rfq is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RFQ not found")

    if payload.status is not None:
        rfq.status = payload.status
    if payload.is_converted is not None:
        rfq.is_converted = payload.is_converted
    rfq.updated_at = datetime.utcnow()
    await db.flush()
    await db.refresh(rfq)
    return rfq
