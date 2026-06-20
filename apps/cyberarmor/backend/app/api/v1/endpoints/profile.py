import hashlib
import re
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.auth import get_current_active_user
from app.crud.user import user as user_crud
from app.db.session import get_db
from app.models.user import User, UserDevice, UserProfile
from app.schemas.user import (
    InstallerDownload,
    UserDeviceCreate,
    UserDeviceRead,
    UserDeviceUpdate,
    UserProfileRead,
    UserProfileUpdate,
)

router = APIRouter()

_SERIAL_PATTERN = re.compile(r"^[A-Z0-9-]+$")
_INSTALLER_BASE = "https://cdn.cyberarmor.example/installers"


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _hash_ua(user_agent: str | None) -> str | None:
    if not user_agent:
        return None
    return hashlib.sha256(user_agent.encode("utf-8")).hexdigest()


def _serial_hash(serial: str) -> str:
    return hashlib.sha256(serial.encode("utf-8")).hexdigest()


def _serial_mask(serial: str) -> str:
    return serial[-4:] if len(serial) >= 4 else serial


async def _load_user_profile(db: AsyncSession, user_obj: User) -> UserProfile:
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user_obj.id)
    )
    profile = result.scalar_one_or_none()
    if profile is None:
        profile = UserProfile(user_id=user_obj.id)
        db.add(profile)
        await db.flush()
        await db.refresh(profile)
    return profile


async def _load_user_devices(db: AsyncSession, user_obj: User) -> list[UserDevice]:
    result = await db.execute(
        select(UserDevice)
        .where(UserDevice.user_id == user_obj.id)
        .order_by(UserDevice.created_at.desc())
    )
    return list(result.scalars().all())


@router.get("/me/profile", response_model=UserProfileRead)
async def read_profile(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> UserProfile:
    return await _load_user_profile(db, current_user)


@router.patch("/me/profile", response_model=UserProfileRead)
async def update_profile(
    request: Request,
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> UserProfile:
    profile = await _load_user_profile(db, current_user)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    profile.updated_at = _now()
    await db.flush()
    await db.refresh(profile)
    await user_crud.log_security_event(
        db,
        "profile_update",
        user_id=current_user.id,
        ip_address=request.client.host if request.client else None,
        user_agent_hash=_hash_ua(request.headers.get("user-agent")),
    )
    return profile


@router.get("/me/devices", response_model=list[UserDeviceRead])
async def list_devices(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> list[UserDevice]:
    return await _load_user_devices(db, current_user)


@router.post("/me/devices", response_model=UserDeviceRead, status_code=status.HTTP_201_CREATED)
async def register_device(
    request: Request,
    payload: UserDeviceCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> UserDevice:
    serial = payload.serial_number.strip().upper()
    if not _SERIAL_PATTERN.match(serial):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Serial number must contain only uppercase letters, digits, and dashes",
        )

    serial_hash = _serial_hash(serial)
    existing = await db.execute(
        select(UserDevice).where(UserDevice.serial_number_hash == serial_hash)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This serial number is already registered",
        )

    device = UserDevice(
        user_id=current_user.id,
        serial_number_hash=serial_hash,
        serial_number_masked=_serial_mask(serial),
        name=payload.name,
        product_variant=payload.product_variant,
        is_active=True,
        is_revoked=False,
        activated_at=_now(),
    )
    db.add(device)
    await db.flush()
    await db.refresh(device)
    await user_crud.log_security_event(
        db,
        "device_registered",
        user_id=current_user.id,
        ip_address=request.client.host if request.client else None,
        user_agent_hash=_hash_ua(request.headers.get("user-agent")),
        metadata={"device_id": str(device.id), "variant": payload.product_variant},
    )
    return device


@router.patch("/me/devices/{device_id}", response_model=UserDeviceRead)
async def update_device(
    request: Request,
    device_id: uuid.UUID,
    payload: UserDeviceUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> UserDevice:
    device = await db.get(UserDevice, device_id)
    if device is None or device.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(device, field, value)
    device.updated_at = _now()
    await db.flush()
    await db.refresh(device)
    await user_crud.log_security_event(
        db,
        "device_updated",
        user_id=current_user.id,
        ip_address=request.client.host if request.client else None,
        user_agent_hash=_hash_ua(request.headers.get("user-agent")),
        metadata={"device_id": str(device.id)},
    )
    return device


@router.delete("/me/devices/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_device(
    request: Request,
    device_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    device = await db.get(UserDevice, device_id)
    if device is None or device.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    device.is_active = False
    device.is_revoked = True
    device.updated_at = _now()
    await db.flush()
    await user_crud.log_security_event(
        db,
        "device_revoked",
        user_id=current_user.id,
        ip_address=request.client.host if request.client else None,
        user_agent_hash=_hash_ua(request.headers.get("user-agent")),
        metadata={"device_id": str(device.id), "serial_mask": device.serial_number_masked},
    )


@router.get("/me/downloads", response_model=list[InstallerDownload])
async def list_downloads(
    current_user: User = Depends(get_current_active_user),
) -> list[InstallerDownload]:
    # Placeholder: real distribution uses signed S3/CloudFront URLs and detached signatures.
    return [
        InstallerDownload(
            platform="Windows",
            version="1.4.2",
            filename="CyberArmor-Setup-1.4.2.msi",
            checksum_sha256="0000000000000000000000000000000000000000000000000000000000000000",
            size_bytes=42_000_000,
            download_url=f"{_INSTALLER_BASE}/CyberArmor-Setup-1.4.2.msi",
            signature_url=f"{_INSTALLER_BASE}/CyberArmor-Setup-1.4.2.msi.sig",
        ),
        InstallerDownload(
            platform="macOS",
            version="1.4.2",
            filename="CyberArmor-1.4.2.dmg",
            checksum_sha256="0000000000000000000000000000000000000000000000000000000000000000",
            size_bytes=38_000_000,
            download_url=f"{_INSTALLER_BASE}/CyberArmor-1.4.2.dmg",
            signature_url=f"{_INSTALLER_BASE}/CyberArmor-1.4.2.dmg.sig",
        ),
        InstallerDownload(
            platform="Linux",
            version="1.4.2",
            filename="cyberarmor_1.4.2_amd64.deb",
            checksum_sha256="0000000000000000000000000000000000000000000000000000000000000000",
            size_bytes=35_000_000,
            download_url=f"{_INSTALLER_BASE}/cyberarmor_1.4.2_amd64.deb",
            signature_url=f"{_INSTALLER_BASE}/cyberarmor_1.4.2_amd64.deb.sig",
        ),
    ]
