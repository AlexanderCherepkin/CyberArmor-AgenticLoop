import uuid
from datetime import datetime

from sqlalchemy import String, Integer, Text, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class RFQRequest(Base):
    __tablename__ = "rfq_requests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contact_email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    company_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    first_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(64), nullable=True)

    seats_min: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    seats_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    infrastructure: Mapped[str | None] = mapped_column(String(32), nullable=True)
    compliance_frameworks: Mapped[str | None] = mapped_column(String(255), nullable=True)
    use_case: Mapped[str | None] = mapped_column(Text, nullable=True)
    timeline: Mapped[str | None] = mapped_column(String(32), nullable=True)
    urgency_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    status: Mapped[str] = mapped_column(String(32), default="new", nullable=False)
    crm_status: Mapped[str | None] = mapped_column(String(32), nullable=True)
    crm_payload: Mapped[str | None] = mapped_column(Text, nullable=True)

    is_converted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )
