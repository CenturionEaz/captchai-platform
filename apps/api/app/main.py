from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
import uvicorn
import logging
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import init_db
from app.api.v1.router import api_router
from app.core.middleware import RateLimitMiddleware, RequestLoggingMiddleware

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown events."""
    logger.info("🚀 CaptchaIQ API starting up...")

    # Validate configuration — warns on missing vars, never crashes
    settings.validate_startup()

    await init_db()
    logger.info(f"🔧 Environment: {settings.ENVIRONMENT}")
    logger.info(f"🌐 CORS origins: {settings.allowed_origins_list}")
    logger.info("✅ CaptchaIQ API ready")
    yield
    logger.info("👋 CaptchaIQ API shutting down...")


app = FastAPI(
    title="CaptchaIQ Platform API",
    description=(
        "AI-powered CAPTCHA intelligence research platform API. "
        "For educational and authorized security research use only. "
        "See /docs for full API documentation."
    ),
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan,
)

# ─── Middleware ───────────────────────────────────────────────────────────────
# Order matters — outermost middleware wraps the rest
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,  # parsed list, not raw string
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

# ─── Routes ──────────────────────────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["System"])
async def health_check():
    """
    Public health check endpoint.
    Used by Render to verify the app is running.
    Returns immediately — no DB calls, no auth.
    """
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
    }


@app.get("/", tags=["System"])
async def root():
    """API root — returns basic platform info."""
    return {
        "name": "CaptchaIQ Platform API",
        "version": "1.0.0",
        "purpose": "AI CAPTCHA research — Educational use only",
        "docs": "/docs",
        "health": "/health",
        "api": "/api/v1",
    }


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development",
        log_level="info",
    )
