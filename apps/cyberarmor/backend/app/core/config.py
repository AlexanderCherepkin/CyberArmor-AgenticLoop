from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_env: str = "development"
    app_name: str = "CyberArmor API"
    app_secret_key: str = "change-me"
    api_base_url: str = "http://localhost:8000"
    cors_origins: str = "http://localhost:3000"
    database_url: str = "postgresql+asyncpg://cyberarmor:cyberarmor@postgres:5432/cyberarmor"
    redis_url: str = "redis://redis:6379/0"

    stripe_secret_key: str | None = None
    stripe_webhook_secret: str | None = None

    class Config:
        env_file = ".env.local"
        env_file_encoding = "utf-8"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
