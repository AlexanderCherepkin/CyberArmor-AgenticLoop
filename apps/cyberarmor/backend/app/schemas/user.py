import uuid
from datetime import datetime
from typing import Any
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(min_length=12, max_length=128)


class UserLogin(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: EmailStr | None = None


class UserRole(BaseModel):
    name: str

    class Config:
        from_attributes = True


class UserRead(BaseModel):
    id: uuid.UUID
    email: str
    is_active: bool
    email_verified: bool
    created_at: datetime
    roles: list[UserRole] = []

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_roles(cls, user_obj: Any) -> "UserRead":
        return cls(
            id=user_obj.id,
            email=user_obj.email,
            is_active=user_obj.is_active,
            email_verified=user_obj.email_verified,
            created_at=user_obj.created_at,
            roles=[{"name": role.name} for role in getattr(user_obj, "roles", [])],
        )


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(min_length=12, max_length=128)


class UserProfileBase(BaseModel):
    first_name: str | None = Field(None, max_length=128)
    last_name: str | None = Field(None, max_length=128)
    phone: str | None = Field(None, max_length=64)
    company_name: str | None = Field(None, max_length=128)
    locale: str | None = Field(None, max_length=8)
    timezone: str | None = Field(None, max_length=64)


class UserProfileUpdate(UserProfileBase):
    pass


class UserProfileRead(UserProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserDeviceBase(BaseModel):
    name: str | None = Field(None, max_length=64)
    product_variant: str | None = Field(None, max_length=32)
    firmware_version: str | None = Field(None, max_length=32)


class UserDeviceCreate(BaseModel):
    serial_number: str = Field(min_length=8, max_length=32, pattern=r"^[A-Za-z0-9-]+$")
    name: str | None = Field(None, max_length=64)
    product_variant: str | None = Field(None, max_length=32)

    @field_validator("serial_number")
    @classmethod
    def _normalize_serial(cls, v: str) -> str:
        return v.strip().upper()


class UserDeviceUpdate(BaseModel):
    name: str | None = Field(None, max_length=64)
    firmware_version: str | None = Field(None, max_length=32)


class UserDeviceRead(UserDeviceBase):
    id: uuid.UUID
    user_id: uuid.UUID
    serial_number_masked: str | None
    is_active: bool
    is_revoked: bool
    activated_at: datetime
    last_seen_at: datetime | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InstallerDownload(BaseModel):
    platform: str
    version: str
    filename: str
    checksum_sha256: str
    size_bytes: int
    download_url: str
    signature_url: str | None = None
