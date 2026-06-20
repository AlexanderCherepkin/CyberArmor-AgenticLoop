import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token,
    delete_refresh_token,
    is_token_revoked,
    new_jti,
    revoke_token,
    store_refresh_token,
    validate_refresh_token,
)
from app.crud.user import user
from app.db.session import get_db
from app.models.user import PasswordResetToken, Role, RoleAssignment, User
from app.schemas.user import (
    PasswordResetConfirm,
    PasswordResetRequest,
    TokenPair,
    UserCreate,
    UserLogin,
    UserRead,
)
from app.services.tasks import send_password_reset_email_task

router = APIRouter()
security = HTTPBearer(auto_error=False)

ACCESS_MAX_AGE = settings.access_token_expire_minutes * 60
REFRESH_MAX_AGE = settings.refresh_token_expire_days * 24 * 60 * 60


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _hash_ua(user_agent: str | None) -> str | None:
    if not user_agent:
        return None
    return hashlib.sha256(user_agent.encode("utf-8")).hexdigest()


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    token = request.cookies.get(settings.access_token_cookie_name)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    payload = decode_token(token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    if await is_token_revoked(payload.get("jti", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revoked")

    result = await db.execute(
        select(User)
        .options(selectinload(User.role_assignments).selectinload(RoleAssignment.role))
        .where(User.id == uuid.UUID(payload["sub"]))
    )
    user_obj = result.scalar_one_or_none()
    if user_obj is None or not user_obj.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    # Expose roles as a convenient attribute for the schema
    user_obj.roles = [assignment.role for assignment in user_obj.role_assignments]
    return user_obj


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user


def _set_auth_cookies(
    response: Response,
    access_token: str,
    refresh_token: str,
) -> None:
    response.set_cookie(
        key=settings.access_token_cookie_name,
        value=access_token,
        max_age=ACCESS_MAX_AGE,
        httponly=True,
        secure=settings.app_env == "production",
        samesite="lax",
        path="/",
    )
    response.set_cookie(
        key=settings.refresh_token_cookie_name,
        value=refresh_token,
        max_age=REFRESH_MAX_AGE,
        httponly=True,
        secure=settings.app_env == "production",
        samesite="lax",
        path="/api/v1/auth/refresh",
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(settings.access_token_cookie_name, path="/")
    response.delete_cookie(settings.refresh_token_cookie_name, path="/api/v1/auth/refresh")


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(
    request: Request,
    payload: UserCreate,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> User:
    existing = await user.get_by_email(db, payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    new_user = await user.create(db, payload.email, payload.password)
    await user.assign_role(db, new_user.id, "b2c_user")
    await user.log_security_event(
        db,
        "registration",
        user_id=new_user.id,
        ip_address=request.client.host if request.client else None,
        user_agent_hash=_hash_ua(request.headers.get("user-agent")),
    )

    access_jti = new_jti()
    refresh_jti = new_jti()
    access_token = create_access_token(str(new_user.id), access_jti)
    refresh_token = create_refresh_token(str(new_user.id), refresh_jti)

    await store_refresh_token(
        refresh_jti,
        str(new_user.id),
        _now() + timedelta(days=settings.refresh_token_expire_days),
    )
    await user.create_session(
        db,
        new_user.id,
        access_jti,
        _now() + timedelta(minutes=settings.access_token_expire_minutes),
        ip_address=request.client.host if request.client else None,
        user_agent_hash=_hash_ua(request.headers.get("user-agent")),
    )

    _set_auth_cookies(response, access_token, refresh_token)
    return new_user


@router.post("/login", response_model=UserRead)
async def login(
    request: Request,
    payload: UserLogin,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> User:
    existing = await user.get_by_email(db, payload.email)
    if existing is None or not await user.verify_password(existing, payload.password):
        await user.log_security_event(
            db,
            "failed_login",
            ip_address=request.client.host if request.client else None,
            user_agent_hash=_hash_ua(request.headers.get("user-agent")),
            metadata={"email": payload.email.lower()},
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    await user.update_last_login(db, existing)
    await user.log_security_event(
        db,
        "login",
        user_id=existing.id,
        ip_address=request.client.host if request.client else None,
        user_agent_hash=_hash_ua(request.headers.get("user-agent")),
    )

    access_jti = new_jti()
    refresh_jti = new_jti()
    access_token = create_access_token(str(existing.id), access_jti)
    refresh_token = create_refresh_token(str(existing.id), refresh_jti)

    await store_refresh_token(
        refresh_jti,
        str(existing.id),
        _now() + timedelta(days=settings.refresh_token_expire_days),
    )
    await user.create_session(
        db,
        existing.id,
        access_jti,
        _now() + timedelta(minutes=settings.access_token_expire_minutes),
        ip_address=request.client.host if request.client else None,
        user_agent_hash=_hash_ua(request.headers.get("user-agent")),
    )

    _set_auth_cookies(response, access_token, refresh_token)
    return existing


@router.post("/refresh", response_model=UserRead)
async def refresh(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> User:
    refresh_token = request.cookies.get(settings.refresh_token_cookie_name)
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")

    payload = decode_token(refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    old_jti = payload.get("jti")
    user_id_str = await validate_refresh_token(old_jti)
    if user_id_str is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token invalid")

    user_obj = await user.get_by_id(db, uuid.UUID(user_id_str))
    if user_obj is None or not user_obj.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    # Rotate: revoke old refresh token and issue new pair
    await delete_refresh_token(old_jti)
    await user.revoke_session(db, old_jti)

    access_jti = new_jti()
    refresh_jti = new_jti()
    new_access = create_access_token(str(user_obj.id), access_jti)
    new_refresh = create_refresh_token(str(user_obj.id), refresh_jti)

    await store_refresh_token(
        refresh_jti,
        str(user_obj.id),
        _now() + timedelta(days=settings.refresh_token_expire_days),
    )
    await user.create_session(
        db,
        user_obj.id,
        access_jti,
        _now() + timedelta(minutes=settings.access_token_expire_minutes),
        ip_address=request.client.host if request.client else None,
        user_agent_hash=_hash_ua(request.headers.get("user-agent")),
    )

    _set_auth_cookies(response, new_access, new_refresh)
    return user_obj


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> None:
    access_token = request.cookies.get(settings.access_token_cookie_name)
    refresh_token = request.cookies.get(settings.refresh_token_cookie_name)

    for token in (access_token, refresh_token):
        if not token:
            continue
        payload = decode_token(token)
        if payload:
            jti = payload.get("jti")
            exp = datetime.fromtimestamp(payload.get("exp"), tz=timezone.utc)
            await revoke_token(jti, exp)
            await user.revoke_session(db, jti)
            if payload.get("type") == "refresh":
                await delete_refresh_token(jti)

    _clear_auth_cookies(response)


@router.post("/password-reset-request", status_code=status.HTTP_202_ACCEPTED)
async def password_reset_request(
    payload: PasswordResetRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    target = await user.get_by_email(db, payload.email)
    if target:
        expires_at = _now() + timedelta(hours=settings.password_reset_token_expire_hours)
        plaintext, _ = await user.create_password_reset_token(db, target, expires_at)
        send_password_reset_email_task.delay(target.email, plaintext, locale="en")
    return {"detail": "If the email exists, a reset link has been sent"}


@router.post("/password-reset-confirm", status_code=status.HTTP_200_OK)
async def password_reset_confirm(
    payload: PasswordResetConfirm,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    token_hash = hashlib.sha256(payload.token.encode("utf-8")).hexdigest()
    reset_token = await user.get_password_reset_token(db, token_hash)
    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    target = reset_token.user
    if not target.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    await user.set_password(db, target, payload.new_password)
    reset_token.is_used = True
    reset_token.used_at = _now()
    await db.flush()

    return {"detail": "Password has been reset"}


@router.get("/me", response_model=UserRead)
async def read_current_user(current_user: User = Depends(get_current_active_user)) -> User:
    return current_user
