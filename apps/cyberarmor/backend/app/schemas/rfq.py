import uuid
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, EmailStr, Field, field_validator

INFRA_CHOICES = ["on-premise", "hybrid-cloud", "air-gapped", "cloud-native"]
COMPLIANCE_CHOICES = ["FIPS", "NIST", "GDPR", "HIPAA", "SOC2", "ISO27001"]
TIMELINE_CHOICES = ["asap", "1-3-months", "3-6-months", "6-12-months", "exploratory"]


class RFQCreate(BaseModel):
    contact_email: EmailStr
    company_name: str | None = Field(None, max_length=128)
    first_name: str | None = Field(None, max_length=128)
    last_name: str | None = Field(None, max_length=128)
    phone: str | None = Field(None, max_length=64)
    seats_min: int = Field(0, ge=0)
    seats_max: int | None = Field(None, ge=0)
    infrastructure: Literal["on-premise", "hybrid-cloud", "air-gapped", "cloud-native"] | None = None
    compliance_frameworks: list[str] | None = Field(None, max_length=20)
    use_case: str | None = Field(None, max_length=2000)
    timeline: Literal["asap", "1-3-months", "3-6-months", "6-12-months", "exploratory"] | None = None

    @field_validator("compliance_frameworks", mode="before")
    @classmethod
    def _normalize_compliance(cls, v: list[str] | None) -> list[str] | None:
        if v is None:
            return None
        normalized = sorted({item.strip().upper() for item in v})
        for item in normalized:
            if item not in COMPLIANCE_CHOICES:
                raise ValueError(f"Unsupported compliance framework: {item}")
        return normalized


class RFQRead(BaseModel):
    id: uuid.UUID
    contact_email: str
    company_name: str | None
    first_name: str | None
    last_name: str | None
    phone: str | None
    seats_min: int
    seats_max: int | None
    infrastructure: str | None
    compliance_frameworks: str | None
    use_case: str | None
    timeline: str | None
    urgency_score: int
    status: str
    crm_status: str | None
    is_converted: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RFQStatusUpdate(BaseModel):
    status: Literal["new", "contacted", "qualified", "proposal", "won", "lost", "spam"] | None = None
    is_converted: bool | None = None
