"""
Middleware — Rate limiting and structured request logging.

RateLimitMiddleware: In-memory sliding-window rate limiter (no Redis required).
RequestLoggingMiddleware: Structured access log with request ID.

Both are lightweight and cold-start safe for Render free tier.
"""
import time
import uuid
import logging
from collections import defaultdict, deque
from typing import Callable

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.types import ASGIApp

logger = logging.getLogger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Sliding-window in-memory rate limiter.

    Defaults: 60 requests/minute per IP.
    Health endpoint is exempted so Render health checks never trip the limiter.
    """

    def __init__(self, app: ASGIApp, requests_per_minute: int = 60) -> None:
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.window_seconds = 60
        # {ip: deque of timestamps}
        self._windows: dict[str, deque] = defaultdict(deque)

    def _get_client_ip(self, request: Request) -> str:
        """Extract real IP, honouring X-Forwarded-For from Render's proxy."""
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Exempt health endpoint from rate limiting
        if request.url.path in ("/health", "/"):
            return await call_next(request)

        ip = self._get_client_ip(request)
        now = time.monotonic()
        window = self._windows[ip]

        # Drop timestamps older than the window
        while window and window[0] < now - self.window_seconds:
            window.popleft()

        if len(window) >= self.requests_per_minute:
            retry_after = int(self.window_seconds - (now - window[0])) + 1
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Rate limit exceeded. Please slow down.",
                    "retry_after_seconds": retry_after,
                },
                headers={"Retry-After": str(retry_after)},
            )

        window.append(now)
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(self.requests_per_minute - len(window))
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Structured access logging middleware.
    Adds X-Request-ID header and logs method, path, status, duration.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = str(uuid.uuid4())[:8]
        start = time.monotonic()

        # Attach request ID so downstream handlers can log it
        request.state.request_id = request_id

        try:
            response = await call_next(request)
        except Exception as exc:
            duration_ms = int((time.monotonic() - start) * 1000)
            logger.error(
                f"[{request_id}] {request.method} {request.url.path} "
                f"ERROR {type(exc).__name__}: {exc} ({duration_ms}ms)"
            )
            raise

        duration_ms = int((time.monotonic() - start) * 1000)
        logger.info(
            f"[{request_id}] {request.method} {request.url.path} "
            f"{response.status_code} ({duration_ms}ms)"
        )

        response.headers["X-Request-ID"] = request_id
        return response
