from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_env: str = "development"
    app_name: str = "CyberArmor API"
    app_secret_key: str = "change-me"
    api_base_url: str = "http://localhost:8000"
    cors_origins: str = "http://localhost:3000"
    database_url: str = "postgresql+asyncpg://cyberarmor:cyberarmor@postgres:5432/cyberarmor"
    redis_url: str = "redis://redis:6379/0"

    jwt_secret_key: str = "change-me-jwt"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    refresh_token_cookie_name: str = "ca_refresh"
    access_token_cookie_name: str = "ca_access"
    token_issuer: str = "cyberarmor-api"

    resend_api_key: str | None = None
    email_from: str = "noreply@cyberarmor.example"
    frontend_url: str = "http://localhost:3000"

    stripe_secret_key: str | None = None
    stripe_publishable_key: str | None = None
    stripe_webhook_secret: str | None = None

    celery_broker_url: str = "redis://redis:6379/0"
    celery_result_backend: str = "redis://redis:6379/0"

    password_reset_token_expire_hours: int = 24

    hubspot_api_key: str | None = None
    salesforce_webhook_url: str | None = None

    class Config:
        env_file = ".env.local"
        env_file_encoding = "utf-8"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
