"""
Generator endpoint — Synthetic CAPTCHA dataset generation.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional
import logging
import io
import zipfile
import json
import base64

from app.core.auth import get_current_user
from app.services.captcha_generator import CaptchaGenerator

logger = logging.getLogger(__name__)
router = APIRouter()
generator = CaptchaGenerator()


class GeneratorConfig(BaseModel):
    kind: str = Field(default="ocr", description="ocr | distorted-text | image-select | slider | audio | adversarial")
    count: int = Field(default=1, ge=1, le=1000, description="Number of samples to generate")
    distortion_level: float = Field(default=40.0, ge=0, le=100)
    noise_level: float = Field(default=30.0, ge=0, le=100)
    font_size: int = Field(default=32, ge=12, le=72)
    rotation: float = Field(default=25.0, ge=0, le=90)
    blur: float = Field(default=0.0, ge=0, le=10)
    color_scheme: str = Field(default="dark", description="dark | light | random")
    adversarial_strength: float = Field(default=20.0, ge=0, le=100)
    include_labels: bool = True


@router.post("/generate", summary="Generate synthetic CAPTCHA samples")
async def generate_samples(
    config: GeneratorConfig,
    user: dict = Depends(get_current_user),
):
    """
    Generate synthetic CAPTCHA images for dataset creation and benchmarking.
    Returns sample metadata including base64-encoded images.
    **Research use only — do not use generated data to attack real systems.**
    """
    try:
        samples = await generator.generate_batch(config.dict(), count=min(config.count, 10))
        return {
            "samples": samples,
            "count": len(samples),
            "config": config.dict(),
        }
    except Exception as e:
        logger.error(f"Generation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Generation pipeline failed")


@router.post("/generate/zip", summary="Download generated dataset as ZIP")
async def generate_zip(
    config: GeneratorConfig,
    user: dict = Depends(get_current_user),
):
    """Generate a batch of CAPTCHAs and return as a ZIP archive with labels JSON."""
    if config.count > 500:
        raise HTTPException(status_code=400, detail="Max 500 samples per ZIP export")

    try:
        samples = await generator.generate_batch(config.dict(), count=config.count)

        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            labels = {}
            for i, sample in enumerate(samples):
                kind = sample.get("kind", "sample")
                fmt = sample.get("format", "PNG").upper()

                if fmt == "PNG" and sample.get("image_b64"):
                    # Real image bytes from generator
                    ext = "png"
                    img_bytes = base64.b64decode(sample["image_b64"])
                    filename = f"{kind}_{i:04d}.{ext}"
                    zf.writestr(filename, img_bytes)
                elif fmt == "JSON":
                    # image-select: metadata only
                    filename = f"{kind}_{i:04d}.json"
                    zf.writestr(filename, json.dumps(sample.get("metadata", {}), indent=2))
                else:
                    # audio or fallback: metadata placeholder
                    filename = f"{kind}_{i:04d}_meta.json"
                    zf.writestr(filename, json.dumps({
                        "id": sample.get("id"),
                        "kind": kind,
                        "label": sample.get("label"),
                        "metadata": sample.get("metadata", {}),
                    }, indent=2))

                if config.include_labels and sample.get("label"):
                    labels[filename] = sample["label"]

            zf.writestr("labels.json", json.dumps(labels, indent=2))
            zf.writestr("metadata.json", json.dumps({
                "config": config.dict(),
                "count": len(samples),
                "generator": "CaptchaIQ Platform v2",
                "purpose": "Synthetic training dataset — Educational/Research use only",
                "user_id": user.get("id") or user.get("sub"),
            }, indent=2))

        buffer.seek(0)
        filename_safe = f"captchaiq_{config.kind}_{len(samples)}samples"
        return StreamingResponse(
            buffer,
            media_type="application/zip",
            headers={"Content-Disposition": f'attachment; filename="{filename_safe}.zip"'},
        )

    except Exception as e:
        logger.error(f"ZIP generation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate dataset ZIP")


@router.get("/types", summary="List available generation types")
async def list_types():
    return {
        "types": [
            {"id": "ocr", "label": "OCR Text", "description": "Randomized text with distortion"},
            {"id": "distorted-text", "label": "Distorted Text", "description": "Heavy wave + morphological distortion"},
            {"id": "image-select", "label": "Image Selection", "description": "Grid-based image selection challenge metadata"},
            {"id": "slider", "label": "Slider", "description": "Puzzle-piece slider gap generation"},
            {"id": "audio", "label": "Audio", "description": "Synthetic audio CAPTCHA metadata"},
            {"id": "adversarial", "label": "Adversarial", "description": "FGSM-style adversarial perturbations"},
        ]
    }
