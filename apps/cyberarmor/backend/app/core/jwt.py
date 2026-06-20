import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

import redis.asyncio as redis
from jose import JWTError, jwt

from app.core.config import settings

_redis_client: redis.Redis | None = None


def get_redis() -> redis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.from_url(settings.redis_url, decode_responses=True)
    return _redis_client


def _now() -> datetime:
    return datetime.now(timezone.utc)


def create_access_token(user_id: str, jti: str) -> str:
    expire = _now() + timedelta(minutes=settings.access_token_expire_minutes)
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "jti": jti,
        "exp": expire,
        "iat": _now(),
        "iss": settings.token_issuer,
        "type": "access",
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm="HS256")


def create_refresh_token(user_id: str, jti: str) -> str:
    expire = _now() + timedelta(days=settings.refresh_token_expire_days)
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "jti": jti,
        "exp": expire,
        "iat": _now(),
        "iss": settings.token_issuer,
        "type": "refresh",
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm="HS256")


def decode_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=["HS256"],
            issuer=settings.token_issuer,
        )
    except JWTError:
        return None


async def is_token_revoked(jti: str) -> bool:
    redis_client = get_redis()
    return await redis_client.exists(f"token:blacklist:{jti}") == 1


async def revoke_token(jti: str, expires_at: datetime) -> None:
    redis_client = get_redis()
    ttl_seconds = int((expires_at - _now()).total_seconds())
    if ttl_seconds > 0:
        await redis_client.setex(f"token:blacklist:{jti}", ttl_seconds, "revoked")


async def store_refresh_token(jti: str, user_id: str, expires_at: datetime) -> None:
    redis_client = get_redis()
    ttl_seconds = int((expires_at - _now()).total_seconds())
    if ttl_seconds > 0:
        await redis_client.setex(
            f"refresh:{jti}",
            ttl_seconds,
            str(user_id),
        )


async def validate_refresh_token(jti: str) -> str | None:
    redis_client = get_redis()
    if await is_token_revoked(jti):
        return None
    user_id = await redis_client.get(f"refresh:{jti}")
    return user_id


async def delete_refresh_token(jti: str) -> None:
    redis_client = get_redis()
    await redis_client.delete(f"refresh:{jti}")


def new_jti() -> str:
    return str(uuid.uuid4())
