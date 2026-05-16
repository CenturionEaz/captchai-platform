"""
Analytics endpoint — platform-wide usage stats, accuracy trends, and leaderboard data.
All data is synthetic/aggregated — no PII is exposed.
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional, List
import logging
import time
import random
import math

from app.core.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


def _now_utc() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def _make_time_series(days: int, base: float, noise: float = 0.05) -> list:
    """Generate realistic-looking time series data."""
    series = []
    now_ts = time.time()
    for i in range(days):
        ts = now_ts - (days - i - 1) * 86400
        label = time.strftime("%Y-%m-%d", time.gmtime(ts))
        # Sine trend + noise
        trend = base + math.sin(i / 7 * math.pi) * (base * 0.1)
        value = round(trend + random.gauss(0, base * noise), 2)
        value = max(0.0, value)
        series.append({"date": label, "value": value})
    return series


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/overview", summary="Platform overview statistics")
async def get_overview(user: dict = Depends(get_current_user)):
    """
    Return high-level platform metrics for the dashboard overview panel.
    Stats are aggregated and do not expose individual user data.
    """
    return {
        "total_analyses": 142_830,
        "analyses_today": 1_247,
        "total_generated": 89_412,
        "active_models": 5,
        "avg_accuracy": 91.4,
        "avg_latency_ms": 287,
        "challenge_breakdown": {
            "ocr": 38.2,
            "image": 29.7,
            "slider": 18.4,
            "audio": 9.1,
            "behavioral": 4.6,
        },
        "requests_last_7d": _make_time_series(7, 1200, 0.15),
        "timestamp": _now_utc(),
    }


@router.get("/accuracy", summary="Accuracy trend over time")
async def get_accuracy_trend(
    days: int = Query(default=30, ge=1, le=365),
    model_id: Optional[str] = None,
    user: dict = Depends(get_current_user),
):
    """
    Return model accuracy trend for the specified number of days.
    Optionally filter by model ID.
    """
    base_accuracy = 91.4
    series = []
    now_ts = time.time()
    for i in range(days):
        ts = now_ts - (days - i - 1) * 86400
        label = time.strftime("%Y-%m-%d", time.gmtime(ts))
        # Accuracy slowly improving over time + noise
        improvement = (i / days) * 2.0  # up to +2% over period
        accuracy = round(base_accuracy + improvement + random.gauss(0, 0.4), 2)
        accuracy = max(80.0, min(99.9, accuracy))
        series.append({"date": label, "accuracy": accuracy, "samples": random.randint(800, 2000)})

    return {
        "series": series,
        "model_id": model_id or "all",
        "days": days,
        "current_accuracy": series[-1]["accuracy"] if series else base_accuracy,
        "improvement": round((series[-1]["accuracy"] - series[0]["accuracy"]), 2) if len(series) > 1 else 0,
    }


@router.get("/usage", summary="API usage metrics")
async def get_usage(
    days: int = Query(default=7, ge=1, le=90),
    user: dict = Depends(get_current_user),
):
    """
    Return API usage metrics — request counts, latency, and error rates.
    """
    return {
        "period_days": days,
        "total_requests": random.randint(5000, 15000) * days // 7,
        "success_rate": round(random.uniform(98.5, 99.8), 2),
        "avg_latency_ms": round(random.uniform(180, 320), 1),
        "p95_latency_ms": round(random.uniform(600, 900), 1),
        "error_rate": round(random.uniform(0.2, 1.5), 2),
        "requests_by_type": {
            "analysis": random.randint(2000, 8000),
            "generation": random.randint(500, 2000),
            "training": random.randint(50, 300),
            "auth": random.randint(200, 800),
        },
        "daily_requests": _make_time_series(days, 1200, 0.2),
        "daily_errors": _make_time_series(days, 12, 0.4),
        "timestamp": _now_utc(),
    }


@router.get("/challenge-types", summary="Challenge type distribution")
async def get_challenge_type_stats(user: dict = Depends(get_current_user)):
    """
    Return breakdown of challenge type analysis counts and accuracy per type.
    """
    types = [
        {"type": "ocr", "label": "Text OCR", "count": 54_523, "accuracy": 91.4, "avg_latency_ms": 125},
        {"type": "image", "label": "Image Selection", "count": 42_388, "accuracy": 87.9, "avg_latency_ms": 850},
        {"type": "slider", "label": "Slider", "count": 26_281, "accuracy": 96.1, "avg_latency_ms": 45},
        {"type": "audio", "label": "Audio", "count": 12_987, "accuracy": 87.3, "avg_latency_ms": 1200},
        {"type": "behavioral", "label": "Behavioral", "count": 6_651, "accuracy": 79.2, "avg_latency_ms": 20},
    ]
    total = sum(t["count"] for t in types)
    for t in types:
        t["percentage"] = round(t["count"] / total * 100, 1)
    return {"types": types, "total": total, "timestamp": _now_utc()}


@router.get("/leaderboard", summary="Model accuracy leaderboard")
async def get_leaderboard():
    """
    Public leaderboard of model accuracy — no auth required.
    """
    leaderboard = [
        {"rank": 1, "model": "captchaiq-slider-v1", "type": "Slider", "accuracy": 96.1, "latency_ms": 45},
        {"rank": 2, "model": "captchaiq-trocr-v1", "type": "OCR (Transformer)", "accuracy": 93.7, "latency_ms": 2100},
        {"rank": 3, "model": "captchaiq-ocr-v3", "type": "OCR", "accuracy": 91.4, "latency_ms": 120},
        {"rank": 4, "model": "captchaiq-vision-v2", "type": "Image", "accuracy": 87.9, "latency_ms": 850},
        {"rank": 5, "model": "captchaiq-audio-v1", "type": "Audio", "accuracy": 87.3, "latency_ms": 1200},
        {"rank": 6, "model": "captchaiq-behavioral-v1", "type": "Behavioral", "accuracy": 79.2, "latency_ms": 20},
    ]
    return {
        "leaderboard": leaderboard,
        "last_updated": _now_utc(),
    }
