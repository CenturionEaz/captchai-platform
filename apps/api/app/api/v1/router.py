from fastapi import APIRouter
from app.api.v1.endpoints import (
    analysis,
    models,
    analytics,
    learning,
    websocket,
    auth,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
api_router.include_router(models.router, prefix="/models", tags=["Models"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(learning.router, prefix="/learning", tags=["Learning"])
api_router.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])
