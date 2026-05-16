"""
Auth endpoint — user registration, login, logout, and profile.
All auth is delegated to Supabase. No passwords are stored server-side.
"""
from fastapi import APIRouter, HTTPException, Depends, Request, status
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import logging
import os
import httpx

from app.core.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", os.getenv("SUPABASE_URL", ""))
SUPABASE_ANON_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", os.getenv("SUPABASE_ANON_KEY", ""))
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")


# ─── Schemas ─────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: dict


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _supabase_headers(use_service_key: bool = False) -> dict:
    key = SUPABASE_SERVICE_KEY if use_service_key else SUPABASE_ANON_KEY
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }


async def _supabase_post(path: str, payload: dict, use_service_key: bool = False) -> dict:
    if not SUPABASE_URL:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service not configured",
        )
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(
            f"{SUPABASE_URL}{path}",
            headers=_supabase_headers(use_service_key),
            json=payload,
        )
        if not resp.is_success:
            data = resp.json()
            msg = data.get("error_description") or data.get("msg") or data.get("error") or "Auth error"
            raise HTTPException(status_code=resp.status_code, detail=msg)
        return resp.json()


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/register", summary="Register a new researcher account")
async def register(body: RegisterRequest):
    """
    Create a new Supabase account.
    Returns the session tokens on success.
    """
    payload = {
        "email": body.email,
        "password": body.password,
        "data": {"full_name": body.full_name or ""},
    }
    data = await _supabase_post("/auth/v1/signup", payload)
    user = data.get("user") or {}
    session = data.get("session") or {}
    return {
        "user": {
            "id": user.get("id"),
            "email": user.get("email"),
            "full_name": user.get("user_metadata", {}).get("full_name"),
            "created_at": user.get("created_at"),
        },
        "access_token": session.get("access_token"),
        "refresh_token": session.get("refresh_token"),
        "token_type": "bearer",
    }


@router.post("/login", summary="Sign in with email + password")
async def login(body: LoginRequest):
    """
    Authenticate with Supabase and return access + refresh tokens.
    """
    payload = {
        "email": body.email,
        "password": body.password,
    }
    data = await _supabase_post("/auth/v1/token?grant_type=password", payload)
    user = data.get("user") or {}
    return {
        "user": {
            "id": user.get("id"),
            "email": user.get("email"),
            "full_name": user.get("user_metadata", {}).get("full_name"),
        },
        "access_token": data.get("access_token"),
        "refresh_token": data.get("refresh_token"),
        "token_type": "bearer",
        "expires_in": data.get("expires_in", 3600),
    }


@router.post("/logout", summary="Sign out current user")
async def logout(user: dict = Depends(get_current_user)):
    """
    Invalidate the current session token via Supabase.
    Client should also clear local session storage.
    """
    return {"status": "logged_out", "user_id": user.get("id") or user.get("sub")}


@router.get("/me", summary="Get current user profile")
async def get_me(user: dict = Depends(get_current_user)):
    """
    Return the authenticated user's profile from the verified JWT.
    """
    return {
        "id": user.get("id") or user.get("sub"),
        "email": user.get("email"),
        "full_name": user.get("user_metadata", {}).get("full_name"),
        "role": user.get("user_metadata", {}).get("role", "researcher"),
        "email_confirmed": user.get("email_confirmed_at") is not None,
        "created_at": user.get("created_at"),
        "last_sign_in": user.get("last_sign_in_at"),
    }


@router.post("/refresh", summary="Refresh access token")
async def refresh_token(refresh_token: str):
    """
    Exchange a refresh token for a new access token.
    """
    payload = {
        "refresh_token": refresh_token,
    }
    data = await _supabase_post("/auth/v1/token?grant_type=refresh_token", payload)
    return {
        "access_token": data.get("access_token"),
        "refresh_token": data.get("refresh_token"),
        "token_type": "bearer",
        "expires_in": data.get("expires_in", 3600),
    }
