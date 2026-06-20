import hashlib
import secrets
import uuid
from datetime import datetime, timezone
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.password import hash_password, verify_password
from app.models.user import (
    PasswordResetToken,
    Role,
    RoleAssignment,
    SecurityEvent,
    User,
    UserSession,
)


class CRUDUser:
    async def get_by_email(self, db: AsyncSession, email: str) -> User | None:
        result = await db.execute(select(User).where(User.email == email.lower()))
        return result.scalar_one_or_none()

    async def get_by_id(self, db: AsyncSession, user_id: uuid.UUID) -> User | None:
        return await db.get(User, user_id)

    async def create(self, db: AsyncSession, email: str, password: str) -> User:
        user = User(
            email=email.lower(),
            hashed_password=hash_password(password),
            is_active=True,
            email_verified=False,
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        return user

    async def update_last_login(self, db: AsyncSession, user: User) -> None:
        user.last_login_at = datetime.utcnow()
        await db.flush()

    async def verify_password(self, user: User, password: str) -> bool:
        if user.hashed_password is None:
            return False
        return verify_password(password, user.hashed_password)

    async def assign_role(self, db: AsyncSession, user_id: uuid.UUID, role_name: str) -> RoleAssignment:
        role_result = await db.execute(select(Role).where(Role.name == role_name))
        role = role_result.scalar_one()
        assignment = RoleAssignment(user_id=user_id, role_id=role.id)
        db.add(assignment)
        await db.flush()
        await db.refresh(assignment)
        return assignment

    async def get_roles(self, db: AsyncSession, user_id: uuid.UUID) -> Sequence[Role]:
        result = await db.execute(
            select(Role)
            .join(RoleAssignment, RoleAssignment.role_id == Role.id)
            .where(RoleAssignment.user_id == user_id)
        )
        return result.scalars().all()

    async def log_security_event(
        self,
        db: AsyncSession,
        event_type: str,
        user_id: uuid.UUID | None = None,
        ip_address: str | None = None,
        user_agent_hash: str | None = None,
        metadata: dict | None = None,
    ) -> None:
        event = SecurityEvent(
            user_id=user_id,
            event_type=event_type,
            ip_address=ip_address,
            user_agent_hash=user_agent_hash,
            metadata=metadata,
        )
        db.add(event)
        await db.flush()

    async def create_session(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        jti: str,
        expires_at: datetime,
        ip_address: str | None = None,
        user_agent_hash: str | None = None,
    ) -> UserSession:
        session = UserSession(
            user_id=user_id,
            jti=jti,
            expires_at=expires_at,
            ip_address=ip_address,
            user_agent_hash=user_agent_hash,
        )
        db.add(session)
        await db.flush()
        await db.refresh(session)
        return session

    async def revoke_session(self, db: AsyncSession, jti: str) -> None:
        result = await db.execute(select(UserSession).where(UserSession.jti == jti))
        session = result.scalar_one_or_none()
        if session:
            session.status = "revoked"
            session.revoked_at = datetime.utcnow()
            await db.flush()

    async def create_password_reset_token(
        self,
        db: AsyncSession,
        user: User,
        expires_at: datetime,
    ) -> tuple[str, PasswordResetToken]:
        plaintext = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(plaintext.encode("utf-8")).hexdigest()
        reset_token = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        db.add(reset_token)
        await db.flush()
        await db.refresh(reset_token)
        return plaintext, reset_token

    async def get_password_reset_token(
        self,
        db: AsyncSession,
        token_hash: str,
    ) -> PasswordResetToken | None:
        result = await db.execute(
            select(PasswordResetToken)
            .where(PasswordResetToken.token_hash == token_hash)
            .where(PasswordResetToken.is_used.is_(False))
            .where(PasswordResetToken.expires_at > datetime.now(timezone.utc))
        )
        return result.scalar_one_or_none()

    async def set_password(self, db: AsyncSession, user: User, password: str) -> None:
        user.hashed_password = hash_password(password)
        await db.flush()


user = CRUDUser()
