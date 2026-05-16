"""
Pydantic schemas for the analysis pipeline.
"""
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class ChallengeType(str, Enum):
    image = "image"
    ocr = "ocr"
    audio = "audio"
    slider = "slider"
    behavioral = "behavioral"
    auto = "auto"


class AnalysisRequest(BaseModel):
    """Request body for text/JSON-based analysis (not multipart)."""
    challenge_type: ChallengeType = ChallengeType.auto
    metadata: Optional[dict] = None


class AlternativePrediction(BaseModel):
    label: str
    confidence: float = Field(ge=0.0, le=1.0)


class AnalysisResponse(BaseModel):
    challenge_type: str
    confidence: float = Field(ge=0.0, le=1.0)
    prediction: str
    processing_time_ms: int
    model_id: str
    pipeline_steps: List[str]
    alternatives: List[AlternativePrediction] = []
    metadata: dict = {}
