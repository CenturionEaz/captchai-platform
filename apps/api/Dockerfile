FROM python:3.11-slim AS base

# Install system dependencies (Tesseract, OpenCV deps)
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ─── Development ──────────────────────────────────────────────────────────────
FROM base AS development
COPY requirements.txt requirements-dev.txt ./
RUN pip install --no-cache-dir -r requirements.txt -r requirements-dev.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--log-level", "debug"]

# ─── Production ───────────────────────────────────────────────────────────────
FROM base AS production
RUN groupadd -r captchaiq && useradd -r -g captchaiq captchaiq
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY --chown=captchaiq:captchaiq . .
USER captchaiq
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--log-level", "info"]
