"""
WebSocket endpoint — real-time training progress streaming.
Falls back gracefully to HTTP polling if WebSocket is not supported.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends
from typing import Optional
import logging
import asyncio
import json
import time

from app.core.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

# Active WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        # job_id -> list of websockets
        self._connections: dict[str, list[WebSocket]] = {}

    async def connect(self, job_id: str, websocket: WebSocket):
        await websocket.accept()
        if job_id not in self._connections:
            self._connections[job_id] = []
        self._connections[job_id].append(websocket)
        logger.info(f"WebSocket connected for job {job_id} | total={len(self._connections[job_id])}")

    def disconnect(self, job_id: str, websocket: WebSocket):
        if job_id in self._connections:
            self._connections[job_id] = [
                ws for ws in self._connections[job_id] if ws != websocket
            ]
            if not self._connections[job_id]:
                del self._connections[job_id]
        logger.info(f"WebSocket disconnected for job {job_id}")

    async def broadcast_to_job(self, job_id: str, message: dict):
        if job_id not in self._connections:
            return
        dead = []
        for websocket in self._connections[job_id]:
            try:
                await websocket.send_text(json.dumps(message))
            except Exception:
                dead.append(websocket)
        for ws in dead:
            self.disconnect(job_id, ws)

    def active_connections(self) -> int:
        return sum(len(v) for v in self._connections.values())


manager = ConnectionManager()


# ─── WebSocket Endpoints ───────────────────────────────────────────────────────

@router.websocket("/progress/{job_id}")
async def training_progress_ws(websocket: WebSocket, job_id: str):
    """
    Stream real-time training progress for a job.
    Sends JSON messages every 2 seconds with current progress.

    Message format:
    {
        "type": "progress" | "complete" | "error" | "heartbeat",
        "job_id": str,
        "progress": float,        // 0-100
        "epoch_current": int,
        "epoch_total": int,
        "accuracy": float,
        "loss": float,
        "timestamp": str
    }
    """
    # Import here to avoid circular dependency with training module
    try:
        from app.api.v1.endpoints.training import _jobs
    except ImportError:
        _jobs = {}

    await manager.connect(job_id, websocket)

    try:
        # Send initial connection ack
        await websocket.send_text(json.dumps({
            "type": "connected",
            "job_id": job_id,
            "message": f"Subscribed to job {job_id}",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }))

        # Stream updates while job is running
        consecutive_heartbeats = 0
        while True:
            job = _jobs.get(job_id)

            if not job:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "job_id": job_id,
                    "message": "Job not found",
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                }))
                break

            if job["status"] == "complete":
                await websocket.send_text(json.dumps({
                    "type": "complete",
                    "job_id": job_id,
                    "progress": 100.0,
                    "epoch_current": job["epoch_total"],
                    "epoch_total": job["epoch_total"],
                    "accuracy_after": job.get("accuracy_after"),
                    "accuracy_before": job.get("accuracy_before"),
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                }))
                break

            if job["status"] == "failed":
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "job_id": job_id,
                    "message": "Training job failed",
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                }))
                break

            # Running or queued — send progress update
            loss_curve = job.get("loss_curve", [])
            latest_loss = loss_curve[-1] if loss_curve else None

            await websocket.send_text(json.dumps({
                "type": "progress",
                "job_id": job_id,
                "status": job["status"],
                "progress": round(job.get("progress", 0), 1),
                "epoch_current": job.get("epoch_current", 0),
                "epoch_total": job.get("epoch_total", 0),
                "accuracy": latest_loss["accuracy"] if latest_loss else None,
                "loss": latest_loss["loss"] if latest_loss else None,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }))

            await asyncio.sleep(2.0)

            # Keep-alive heartbeat every 30s
            consecutive_heartbeats += 1
            if consecutive_heartbeats % 15 == 0:
                await websocket.send_text(json.dumps({
                    "type": "heartbeat",
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                }))

    except WebSocketDisconnect:
        logger.info(f"Client disconnected from job {job_id}")
    except Exception as e:
        logger.error(f"WebSocket error for job {job_id}: {e}")
    finally:
        manager.disconnect(job_id, websocket)


@router.websocket("/analysis-stream")
async def analysis_stream_ws(websocket: WebSocket):
    """
    Stream live analysis results as they complete.
    Clients subscribe and receive analysis events in real-time.
    """
    await websocket.accept()
    try:
        await websocket.send_text(json.dumps({
            "type": "connected",
            "message": "Subscribed to analysis stream",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }))

        # Keep connection alive with heartbeats
        while True:
            await asyncio.sleep(30)
            await websocket.send_text(json.dumps({
                "type": "heartbeat",
                "active_connections": manager.active_connections(),
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }))

    except WebSocketDisconnect:
        logger.info("Analysis stream client disconnected")
    except Exception as e:
        logger.error(f"Analysis stream WebSocket error: {e}")


# ─── HTTP fallback — poll-based status ────────────────────────────────────────

@router.get("/status", summary="WebSocket server status")
async def websocket_status():
    """
    REST fallback: check WebSocket server health and active connections.
    Use this if WebSocket is not supported in the client environment.
    """
    return {
        "status": "healthy",
        "active_connections": manager.active_connections(),
        "websocket_endpoints": [
            "/api/v1/ws/progress/{job_id}",
            "/api/v1/ws/analysis-stream",
        ],
        "fallback_polling": {
            "training_job_status": "/api/v1/training/jobs/{job_id}",
            "analysis_result": "/api/v1/analysis/analyze",
        },
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
