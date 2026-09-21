from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:Post123@localhost:5432/krishikarya"

    # JWT
    SECRET_KEY: str = "change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: str = "http://localhost:3001,http://127.0.0.1:3001,http://localhost:5500,http://127.0.0.1:5500"

    # Email (Gmail SMTP)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "Krishi Karya <noreply@krishikarya.in>"

    # OTP
    OTP_EXPIRE_MINUTES: int = 10

    # Separate service hosting the trained quality and demand models.
    AI_MODEL_SERVICE_URL: str = "http://127.0.0.1:8002"
    AI_MODEL_SERVICE_TIMEOUT: float = 90.0

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    @property
    def email_configured(self) -> bool:
        """True only if real SMTP credentials are set."""
        return bool(self.SMTP_USER and self.SMTP_PASSWORD
                    and "your_16char" not in self.SMTP_PASSWORD)

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
