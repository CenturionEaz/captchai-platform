"""
App configuration via pydantic-settings.

Reads from environment variables (Render injects them directly) and falls back
to a local .env file for development. All values have safe defaults so the app
can start and report configuration issues rather than crash silently.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
import os
import json
import logging

logger = logging.getLogger(__name__)


def _parse_origins(raw: str | List[str]) -> List[str]:
    """Parse ALLOWED_ORIGINS — supports JSON array string or plain string."""
    if isinstance(raw, list):
        return raw
    raw = raw.strip()
    if raw.startswith("["):
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            pass
    # Comma-separated fallback
    return [o.strip() for o in raw.split(",") if o.strip()]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",  # Ignore unknown env vars from Render/Vercel
    )

    # ─── App ──────────────────────────────────────────────────────────────────
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "change-this-in-production-to-a-random-256-bit-key"
    API_TITLE: str = "CaptchaIQ Platform API"
    DEBUG: bool = False

    # ─── CORS ─────────────────────────────────────────────────────────────────
    # Accepts JSON array string e.g. '["https://app.vercel.app","http://localhost:3000"]'
    # or plain comma-separated "https://app.vercel.app,http://localhost:3000"
    ALLOWED_ORIGINS: str = '["http://localhost:3000","http://localhost:3001"]'

    # ─── Supabase ─────────────────────────────────────────────────────────────
    # Accept both prefixed and unprefixed env var names
    NEXT_PUBLIC_SUPABASE_URL: str = ""
    NEXT_PUBLIC_SUPABASE_ANON_KEY: str = ""
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # ─── AI Models ────────────────────────────────────────────────────────────
    HF_TOKEN: str = ""
    MODEL_CACHE_DIR: str = "./models"

    # ─── Rate Limiting ────────────────────────────────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_BURST: int = 10

    # ─── Auth / JWT ───────────────────────────────────────────────────────────
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_EXPIRE_DAYS: int = 7

    # ─── Storage ──────────────────────────────────────────────────────────────
    STORAGE_BACKEND: str = "supabase"
    LOCAL_STORAGE_PATH: str = "./uploads"

    # ─── Email ────────────────────────────────────────────────────────────────
    RESEND_API_KEY: str = ""
    RESEND_FROM_NAME: str = "CaptchaIQ Research"
    RESEND_FROM_EMAIL: str = "noreply@captchaiq.dev"

    @property
    def allowed_origins_list(self) -> List[str]:
        """Return ALLOWED_ORIGINS parsed as a proper Python list."""
        return _parse_origins(self.ALLOWED_ORIGINS)

    @property
    def supabase_url(self) -> str:
        """Return Supabase URL from either prefixed or unprefixed env var."""
        return self.NEXT_PUBLIC_SUPABASE_URL or self.SUPABASE_URL

    @property
    def supabase_anon_key(self) -> str:
        """Return Supabase anon key from either prefixed or unprefixed env var."""
        return self.NEXT_PUBLIC_SUPABASE_ANON_KEY or self.SUPABASE_ANON_KEY

    def validate_startup(self) -> None:
        """
        Log warnings for missing critical configuration.
        Called at startup — never raises, just warns so the app still boots.
        """
        missing = []
        if not self.supabase_url:
            missing.append("NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)")
        if not self.supabase_anon_key:
            missing.append("NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)")
        if not self.SUPABASE_SERVICE_ROLE_KEY:
            missing.append("SUPABASE_SERVICE_ROLE_KEY")
        if not self.HF_TOKEN:
            missing.append("HF_TOKEN (AI features will use fallback responses)")

        if missing:
            logger.warning(
                f"⚠️  Missing configuration — some features will be degraded:\n"
                + "\n".join(f"   • {v}" for v in missing)
            )
        else:
            logger.info("✅ All required environment variables are set")


settings = Settings()
