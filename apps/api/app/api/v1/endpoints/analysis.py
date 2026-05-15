"""
Analysis endpoint — CAPTCHA challenge analysis pipeline.

⚠️  EDUCATIONAL/RESEARCH USE ONLY
This API endpoint is intended strictly for:
- Authorized security research
- CAPTCHA robustness benchmarking on owned systems  
- Educational AI/ML experimentation

Usage against systems without explicit authorization is prohibited.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List
import time
import logging

from app.services.ai_pipeline import AIPipeline
from app.services.challenge_detector import ChallengeDetector
from app.schemas.analysis import AnalysisRequest, AnalysisResponse, ChallengeType
from app.core.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

pipeline = AIPipeline()
detector = ChallengeDetector()


class AnalysisResult(BaseModel):
    challenge_type: str
    confidence: float = Field(ge=0.0, le=1.0)
    prediction: str
    processing_time_ms: int
    model_id: str
    pipeline_steps: List[str]
    alternatives: List[dict]
    metadata: dict


@router.post(
    "/analyze",
    response_model=AnalysisResult,
    summary="Analyze a CAPTCHA challenge",
    description=(
        "Submit a CAPTCHA image or audio file for AI-powered research analysis. "
        "Returns classification, confidence score, and pipeline metadata. "
        "**For authorized research use only.**"
    ),
)
async def analyze_challenge(
    file: UploadFile = File(..., description="CAPTCHA image (PNG/JPG/WebP) or audio (WAV/MP3)"),
    challenge_type: Optional[str] = Form(default="auto", description="Force a specific challenge type or use 'auto' for detection"),
    user: dict = Depends(get_current_user),
):
    start = time.monotonic()

    # Validate file
    allowed_types = {"image/png", "image/jpeg", "image/webp", "audio/wav", "audio/mpeg"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {file.content_type}. Allowed: {allowed_types}",
        )

    if file.size and file.size > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Max 10MB.")

    contents = await file.read()

    try:
        # Auto-detect challenge type if not specified
        if challenge_type == "auto":
            detected_type = await detector.detect(contents, file.content_type)
        else:
            detected_type = challenge_type

        # Run the appropriate pipeline
        result = await pipeline.analyze(
            data=contents,
            content_type=file.content_type,
            challenge_type=detected_type,
        )

        elapsed_ms = int((time.monotonic() - start) * 1000)

        logger.info(
            f"Analysis complete | type={detected_type} | conf={result['confidence']:.3f} | "
            f"time={elapsed_ms}ms | user={user.get('sub', 'unknown')}"
        )

        return AnalysisResult(
            challenge_type=detected_type,
            confidence=result["confidence"],
            prediction=result["prediction"],
            processing_time_ms=elapsed_ms,
            model_id=result["model_id"],
            pipeline_steps=result["pipeline_steps"],
            alternatives=result.get("alternatives", []),
            metadata={
                "file_size": len(contents),
                "content_type": file.content_type,
                "user_id": user.get("sub"),
            },
        )

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Analysis pipeline failed. Check logs.")


@router.post(
    "/feedback",
    summary="Submit correction feedback",
    description="Submit a correction to improve the learning engine when the AI prediction was wrong.",
)
async def submit_feedback(
    analysis_id: str,
    correct_label: str,
    user: dict = Depends(get_current_user),
):
    """Ingest user correction into the learning feedback loop."""
    try:
        await pipeline.ingest_correction(
            analysis_id=analysis_id,
            correct_label=correct_label,
            user_id=user.get("sub"),
        )
        return {"status": "accepted", "message": "Correction queued for retraining"}
    except Exception as e:
        logger.error(f"Feedback ingestion failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to record feedback")


@router.get(
    "/types",
    summary="List supported challenge types",
)
async def list_challenge_types():
    return {
        "types": [
            {"id": "image", "label": "Image Selection", "description": "Grid-based image classification"},
            {"id": "ocr", "label": "Text OCR", "description": "Distorted text recognition"},
            {"id": "audio", "label": "Audio", "description": "Audio CAPTCHA transcription"},
            {"id": "slider", "label": "Slider", "description": "Slider gap detection"},
            {"id": "behavioral", "label": "Behavioral", "description": "Behavioral pattern analysis"},
        ]
    }
