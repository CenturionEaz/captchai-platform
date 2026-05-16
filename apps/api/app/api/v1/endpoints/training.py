"""
Training Jobs endpoint — AI model training management.
Jobs run as background tasks with real-time progress via WebSocket.
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
import logging
import uuid
import asyncio
import time
from datetime import datetime, timezone

from app.core.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


def _utcnow() -> str:
    """Return current UTC time as ISO 8601 string."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


class TrainingJobCreate(BaseModel):
    model_id: str
    dataset_id: Optional[str] = None
    config: dict = {}
    epoch_total: int = 10
    trigger: str = "manual"


class TrainingJobResponse(BaseModel):
    id: str
    model_id: str
    status: str
    progress: float
    epoch_current: int
    epoch_total: int
    accuracy_before: Optional[float]
    accuracy_after: Optional[float]
    trigger: str
    created_at: str


# In-memory job store (survives until process restart — acceptable for demo)
_jobs: dict = {}


async def _simulate_training(job_id: str, epochs: int):
    """Simulate training progress — replace with real ML job queue in production."""
    job = _jobs.get(job_id)
    if not job:
        return

    job["status"] = "running"
    job["started_at"] = _utcnow()

    for epoch in range(1, epochs + 1):
        await asyncio.sleep(2)

        # Check if job was paused mid-run
        if job.get("status") == "paused":
            logger.info(f"Job {job_id} paused at epoch {epoch}")
            return

        progress = (epoch / epochs) * 100
        loss = max(0.05, 0.4 - epoch * 0.02 + (0.01 * (epoch % 3)))
        accuracy = min(0.99, 0.75 + epoch * 0.025)

        job["progress"] = round(progress, 1)
        job["epoch_current"] = epoch
        job["loss_curve"].append({
            "epoch": epoch,
            "loss": round(loss, 4),
            "accuracy": round(accuracy, 4),
        })
        job["accuracy_after"] = round(accuracy * 100, 1)

    job["status"] = "complete"
    job["completed_at"] = _utcnow()
    logger.info(f"Training job {job_id} complete — accuracy: {job['accuracy_after']}%")


@router.post("/jobs", summary="Create a training job")
async def create_training_job(
    body: TrainingJobCreate,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user),
):
    """
    Start a new model training job.
    Returns immediately — progress is streamed via WebSocket /api/v1/ws/progress/{job_id}.
    Poll GET /api/v1/training/jobs/{job_id} if WebSocket is unavailable.
    """
    job_id = f"job-{uuid.uuid4().hex[:8]}"
    now = _utcnow()

    job = {
        "id": job_id,
        "model_id": body.model_id,
        "dataset_id": body.dataset_id,
        "config": body.config,
        "status": "queued",
        "progress": 0.0,
        "epoch_current": 0,
        "epoch_total": body.epoch_total,
        "accuracy_before": 89.2,
        "accuracy_after": None,
        "loss_curve": [],
        "trigger": body.trigger,
        "user_id": user.get("id") or user.get("sub"),
        "created_at": now,
        "started_at": None,
        "completed_at": None,
    }
    _jobs[job_id] = job
    background_tasks.add_task(_simulate_training, job_id, body.epoch_total)
    logger.info(f"Training job {job_id} queued for model {body.model_id}")
    return job


@router.get("/jobs", summary="List all training jobs")
async def list_jobs(user: dict = Depends(get_current_user)):
    """Return all training jobs belonging to the authenticated user."""
    user_id = user.get("id") or user.get("sub")
    user_jobs = [j for j in _jobs.values() if j.get("user_id") == user_id]
    user_jobs.sort(key=lambda j: j["created_at"], reverse=True)
    return {"jobs": user_jobs, "count": len(user_jobs)}


@router.get("/jobs/{job_id}", summary="Get training job status")
async def get_job(job_id: str, user: dict = Depends(get_current_user)):
    """
    Poll the status of a training job.
    Returns current progress, epoch, accuracy, and loss curve.
    """
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found")
    return job


@router.delete("/jobs/{job_id}", summary="Delete a training job")
async def delete_job(job_id: str, user: dict = Depends(get_current_user)):
    """Cancel and delete a training job record."""
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    user_id = user.get("id") or user.get("sub")
    if job.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this job")
    del _jobs[job_id]
    return {"status": "deleted", "job_id": job_id}


@router.post("/jobs/{job_id}/pause", summary="Pause a running training job")
async def pause_job(job_id: str, user: dict = Depends(get_current_user)):
    """Pause a running training job. Resume with /retry."""
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] not in ("running", "queued"):
        raise HTTPException(status_code=400, detail=f"Cannot pause job in status: {job['status']}")
    job["status"] = "paused"
    logger.info(f"Job {job_id} paused by user")
    return {"status": "paused", "job_id": job_id}


@router.post("/jobs/{job_id}/retry", summary="Retry a failed or paused job")
async def retry_job(
    job_id: str,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user),
):
    """Restart a failed or paused training job from the beginning."""
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] not in ("failed", "paused", "complete"):
        raise HTTPException(status_code=400, detail=f"Cannot retry job in status: {job['status']}")

    job["status"] = "queued"
    job["progress"] = 0.0
    job["epoch_current"] = 0
    job["loss_curve"] = []
    job["accuracy_after"] = None
    job["started_at"] = None
    job["completed_at"] = None

    background_tasks.add_task(_simulate_training, job_id, job["epoch_total"])
    logger.info(f"Job {job_id} requeued for retry")
    return {"status": "queued", "job_id": job_id}


@router.get("/presets", summary="List training configuration presets")
async def list_presets():
    """Return predefined training configuration presets."""
    return {
        "presets": [
            {
                "id": "quick",
                "name": "Quick Test",
                "description": "Fast 5-epoch run for validation",
                "epoch_total": 5,
                "config": {"lr": 0.001, "batch_size": 32},
            },
            {
                "id": "standard",
                "name": "Standard Training",
                "description": "10-epoch balanced training run",
                "epoch_total": 10,
                "config": {"lr": 0.0005, "batch_size": 64},
            },
            {
                "id": "deep",
                "name": "Deep Training",
                "description": "25-epoch high-accuracy training",
                "epoch_total": 25,
                "config": {"lr": 0.0001, "batch_size": 128},
            },
        ]
    }
