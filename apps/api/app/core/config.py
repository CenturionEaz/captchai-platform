from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # ─── App ──────────────────────────────────────────────────────────────────
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "change-this-in-production-to-a-random-256-bit-key"
    API_TITLE: str = "CaptchaIQ Platform API"
    DEBUG: bool = False

    # ─── CORS ─────────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]

    # ─── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql://captchaiq:password@localhost:5432/captchaiq"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    # ─── Supabase ─────────────────────────────────────────────────────────────
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # ─── Redis (for rate limiting & queuing) ──────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379"

    # ─── AI Models ────────────────────────────────────────────────────────────
    HF_TOKEN: str = ""
    MODEL_CACHE_DIR: str = "./models"
    TESSERACT_CMD: str = "tesseract"
    WHISPER_MODEL: str = "base"

    # ─── Rate Limiting ────────────────────────────────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_BURST: int = 10

    # ─── Auth / JWT ───────────────────────────────────────────────────────────
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_EXPIRE_DAYS: int = 7

    # ─── Storage ──────────────────────────────────────────────────────────────
    STORAGE_BACKEND: str = "supabase"  # "supabase" | "local" | "r2"
    LOCAL_STORAGE_PATH: str = "./uploads"


settings = Settings()
