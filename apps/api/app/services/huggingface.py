"""
HuggingFace integration service.
All model downloads and inference happen server-side.
HF_TOKEN is never exposed to the frontend.
"""
import logging
import os
from typing import Optional
from functools import lru_cache

import httpx

logger = logging.getLogger(__name__)

HF_TOKEN = os.getenv("HF_TOKEN", "")
HF_BASE_URL = "https://api-inference.huggingface.co"
HF_MODELS = {
    "ocr": "microsoft/trocr-large-printed",
    "audio": "openai/whisper-base",
    "classification": "google/vit-base-patch16-224",
    "detection": "facebook/detr-resnet-50",
    "embedding": "sentence-transformers/all-MiniLM-L6-v2",
}


def _get_headers() -> dict:
    if not HF_TOKEN:
        raise RuntimeError("HF_TOKEN not configured")
    return {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json",
    }


async def run_inference(model_key: str, payload: dict, raw_bytes: bool = False) -> dict:
    """
    Run inference on a HuggingFace hosted model.

    Args:
        model_key: Key from HF_MODELS dict ('ocr', 'audio', etc.)
        payload: The request payload (inputs, parameters)
        raw_bytes: If True, send raw bytes instead of JSON (for image/audio)

    Returns:
        Model inference result
    """
    model_id = HF_MODELS.get(model_key)
    if not model_id:
        raise ValueError(f"Unknown model key: {model_key}. Valid: {list(HF_MODELS.keys())}")

    url = f"{HF_BASE_URL}/models/{model_id}"
    headers = _get_headers()

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, headers=headers, json=payload)

        if resp.status_code == 503:
            # Model is loading — return status
            return {"status": "loading", "estimated_time": resp.json().get("estimated_time", 20)}
        elif resp.status_code == 429:
            raise RuntimeError("HuggingFace rate limit exceeded")
        elif not resp.is_success:
            logger.error(f"HF inference error {resp.status_code}: {resp.text}")
            raise RuntimeError(f"Inference failed: {resp.status_code}")

        return resp.json()


async def classify_image_bytes(image_bytes: bytes, model_key: str = "classification") -> dict:
    """Run image classification on raw image bytes."""
    model_id = HF_MODELS.get(model_key, model_key)
    url = f"{HF_BASE_URL}/models/{model_id}"
    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, headers=headers, content=image_bytes)
        resp.raise_for_status()
        return resp.json()


async def transcribe_audio_bytes(audio_bytes: bytes) -> str:
    """Transcribe audio CAPTCHA using Whisper."""
    result = await classify_image_bytes(audio_bytes, "audio")
    if isinstance(result, dict):
        return result.get("text", "")
    return ""


async def get_text_embedding(text: str) -> list[float]:
    """Get sentence embedding for vector similarity search."""
    result = await run_inference("embedding", {"inputs": text})
    if isinstance(result, list) and len(result) > 0:
        # SentenceTransformer returns [[...]] or [...]
        return result[0] if isinstance(result[0], list) else result
    return []


async def check_model_availability(model_key: str) -> dict:
    """Check if a HuggingFace model is loaded and available."""
    model_id = HF_MODELS.get(model_key)
    if not model_id:
        return {"available": False, "error": "Unknown model"}

    try:
        result = await run_inference(model_key, {"inputs": "test"})
        if result.get("status") == "loading":
            return {"available": False, "loading": True, "estimated_time": result.get("estimated_time")}
        return {"available": True, "model_id": model_id}
    except Exception as e:
        return {"available": False, "error": str(e)}


def get_model_catalog() -> dict:
    """Return the model catalog (no HF_TOKEN needed — public info)."""
    return {k: v for k, v in HF_MODELS.items()}
