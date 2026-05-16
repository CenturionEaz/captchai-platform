# ─── CaptchaIQ API Dockerfile ────────────────────────────────────────────────
#
# Build targets:
#   development  → hot-reload, debug logging
#   production   → non-root user, single worker (Render free tier safe)
#
# System deps:
#   - tesseract-ocr: optional OCR — app works without it via HF API fallback
#   - libgl1, libglib2.0: required by opencv-python-headless
#   - curl: used for Docker HEALTHCHECK
# ─────────────────────────────────────────────────────────────────────────────

FROM python:3.11-slim AS base

# Install system dependencies
# tesseract-ocr is optional — if absent, the app falls back to HuggingFace API
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies (cached layer — only re-runs if requirements change)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ─── Development stage ────────────────────────────────────────────────────────
FROM base AS development
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", \
     "--reload", "--log-level", "debug"]

# ─── Production stage ─────────────────────────────────────────────────────────
FROM base AS production

# Run as non-root user for security
RUN groupadd -r captchaiq && useradd -r -g captchaiq captchaiq

COPY --chown=captchaiq:captchaiq . .

USER captchaiq

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Single worker for Render free tier (512MB RAM)
# Scale up workers on paid plans
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", \
     "--workers", "1", "--loop", "asyncio", "--log-level", "info"]
