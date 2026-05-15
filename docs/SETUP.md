# CaptchaIQ Platform — Complete Setup Guide

> **For beginners.** This guide walks you through every step, every key, and every command needed to run CaptchaIQ.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone the Repository](#2-clone-the-repository)
3. [Configure Environment Variables](#3-configure-environment-variables)
4. [Supabase Setup](#4-supabase-setup)
5. [Configure OAuth (GitHub + Google)](#5-configure-oauth-github--google)
6. [Resend Setup (Emails)](#6-resend-setup-emails)
7. [HuggingFace Setup](#7-huggingface-setup)
8. [Vercel Deployment](#8-vercel-deployment)
9. [Run Locally](#9-run-locally)
10. [Security Best Practices](#10-security-best-practices)
11. [Rotate Secrets](#11-rotate-secrets)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Prerequisites

Install these tools first:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 20+ | https://nodejs.org |
| Python | 3.11+ | https://python.org |
| Git | Any | https://git-scm.com |
| Docker | 24+ | https://docker.com |

Verify installations:
```bash
node --version    # Should show v20.x.x
python --version  # Should show 3.11.x
git --version
docker --version
```

---

## 2. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/captchaiq-platform.git
cd captchaiq-platform
```

---

## 3. Configure Environment Variables

**Step 1:** Copy the example file:
```bash
cp .env.example .env.local
```

**Step 2:** Open `.env.local` in a text editor and fill in each value. The sections below explain where to find each value.

> ⚠️ **NEVER commit `.env.local` to git.** It's already in `.gitignore`, but double-check before pushing.

---

## 4. Supabase Setup

### 4a. Create a Supabase Project

1. Go to **https://supabase.com** → Sign up / Log in
2. Click **"New Project"**
3. Choose a name: `captchaiq`
4. Choose a strong database password and **save it**
5. Choose your region (closest to you)
6. Click **"Create new project"** — wait ~2 minutes

### 4b. Get Your API Keys

1. In your project dashboard, click **"Project Settings"** (gear icon, left sidebar)
2. Click **"API"** in the settings menu
3. You'll see:

```
Project URL:        https://xxxx.supabase.co         → NEXT_PUBLIC_SUPABASE_URL
anon public key:    eyJhbGciOiJ...                   → NEXT_PUBLIC_SUPABASE_ANON_KEY
service_role key:   eyJhbGciOiJ...                   → SUPABASE_SERVICE_ROLE_KEY  ⚠️ KEEP SECRET
```

Copy each into `.env.local`.

### 4c. Run Database Migrations

1. In Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New query"**
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click **"Run"** — wait for success
5. Repeat for `supabase/migrations/002_phase2_schema.sql`

### 4d. Enable Email Auth

1. Go to **Authentication** → **Providers**
2. Make sure **"Email"** is enabled
3. Under **"Email"**, configure:
   - Enable email confirmations: **ON** (recommended)
   - Secure email change: **ON**

### 4e. Set Auth Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   https://YOUR-VERCEL-URL.vercel.app/auth/callback
   https://yourdomain.com/auth/callback
   ```

---

## 5. Configure OAuth (GitHub + Google)

### 5a. GitHub OAuth

1. Go to **https://github.com/settings/developers**
2. Click **"New OAuth App"**
3. Fill in:
   - Application name: `CaptchaIQ Research`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `https://xxxx.supabase.co/auth/v1/callback`
     (Replace `xxxx` with your Supabase Project ID)
4. Click **"Register application"**
5. Copy the **Client ID** and generate a **Client secret**
6. In Supabase: **Authentication** → **Providers** → **GitHub** → paste Client ID + Secret → **Save**

### 5b. Google OAuth

1. Go to **https://console.cloud.google.com**
2. Create a new project (or select existing)
3. Go to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth client ID"**
5. Application type: **Web application**
6. Authorized redirect URIs: `https://xxxx.supabase.co/auth/v1/callback`
7. Copy **Client ID** and **Client Secret**
8. In Supabase: **Authentication** → **Providers** → **Google** → paste → **Save**

---

## 6. Resend Setup (Emails)

CaptchaIQ uses Resend for transactional emails (welcome, password reset, alerts).

1. Go to **https://resend.com** → Sign up
2. Go to **API Keys** → **"Create API Key"**
3. Name it `captchaiq-production`
4. Copy the key (starts with `re_`) → paste into `.env.local` as `RESEND_API_KEY`
5. Go to **Domains** → Add your domain (or use `onboarding@resend.dev` for testing)
6. Set `RESEND_FROM_EMAIL` to a verified address

> 💡 For local development, emails still send but you can also check them in the Resend dashboard at https://resend.com/emails

---

## 7. HuggingFace Setup

CaptchaIQ uses HuggingFace for AI model inference (OCR, Audio, Vision).

1. Go to **https://huggingface.co** → Sign up / Log in
2. Click your profile → **"Settings"** → **"Access Tokens"**
3. Click **"New token"**
4. Name: `captchaiq-api`
5. Role: **Read** (sufficient for inference)
6. Copy the token (starts with `hf_`) → paste into `.env.local` as `HF_TOKEN`

> ⚠️ The HF token is ONLY used in the FastAPI backend. It never reaches the browser.

---

## 8. Vercel Deployment

### 8a. Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

### 8b. Link Your Project

```bash
cd apps/web
vercel link
# Select: your Vercel team → your project (or create new)
```

### 8c. Set Environment Variables in Vercel

Go to **https://vercel.com** → Your project → **Settings** → **Environment Variables**

Add each variable:

| Variable | Value | Where |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | All environments |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` (anon key) | All environments |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` (service role) | **Production only** ⚠️ |
| `RESEND_API_KEY` | `re_...` | Production |
| `HF_TOKEN` | `hf_...` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Production |
| `NEXT_PUBLIC_API_URL` | `https://your-api.railway.app` | Production |

### 8d. Deploy

```bash
# Preview deploy (for testing):
vercel

# Production deploy:
vercel --prod
```

Or push to `main` branch — Vercel auto-deploys if GitHub is connected.

---

## 9. Run Locally

### Frontend (Next.js)

```bash
cd apps/web
npm install
npm run dev
# → http://localhost:3000
```

### Backend (FastAPI)

```bash
cd apps/api
python -m venv .venv
.venv\Scripts\activate         # Windows
# source .venv/bin/activate    # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000/docs
```

### Full Stack with Docker

```bash
# From project root:
docker compose -f docker/docker-compose.dev.yml up -d
# Web:  http://localhost:3000
# API:  http://localhost:8000/docs
# DB:   http://localhost:8080 (Adminer)
```

---

## 10. Security Best Practices

### ✅ What's Already Protected
- All `/dashboard` routes require authentication via Next.js middleware
- Service role key is server-side only
- All database tables use Row Level Security (RLS)
- Security headers (CSP, X-Frame-Options) added to all responses
- Rate limiting on API endpoints

### ✅ Things You Must Do
- [ ] Use a strong, randomly generated `SECRET_KEY`
- [ ] Enable 2FA on your Supabase account
- [ ] Enable 2FA on your GitHub account
- [ ] Rotate API keys every 90 days (see section 11)
- [ ] Never paste secrets into AI chatbots, GitHub issues, or Slack
- [ ] Use Vercel's encrypted environment variables for all secrets

### ⚠️ Things to Never Do
- Never prefix private keys with `NEXT_PUBLIC_`
- Never commit `.env.local`, `.env.docker`, or `.env.production`
- Never paste the `SUPABASE_SERVICE_ROLE_KEY` into frontend code
- Never share your `VERCEL_TOKEN` publicly

---

## 11. Rotate Secrets

If a secret is compromised, rotate immediately:

### Rotate Supabase Keys
1. Supabase Dashboard → **Project Settings** → **API** → **"Rotate API keys"**
2. Update `.env.local`, Vercel env vars, and Docker env

### Rotate Resend Key
1. https://resend.com → **API Keys** → Delete old → Create new
2. Update all environments

### Rotate HuggingFace Token
1. HuggingFace → **Settings** → **Access Tokens** → Delete old → Create new
2. Update all environments

### Generate New SECRET_KEY
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## 12. Troubleshooting

### "Invalid JWT" errors
- Check `NEXT_PUBLIC_SUPABASE_URL` matches your project exactly
- Make sure you're using the **anon key** (not service role) for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### "Redirect loop on /login"
- Your middleware may not be recognizing the session cookie
- Try clearing browser cookies for `localhost`
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

### OAuth redirects to wrong URL
- Check Supabase → Auth → URL Configuration → Redirect URLs includes your exact URL
- GitHub/Google callback URL must exactly match `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`

### Emails not sending
- Verify `RESEND_API_KEY` starts with `re_`
- Check Resend dashboard → Emails tab to see if emails are being sent
- Confirm your `RESEND_FROM_EMAIL` is a verified domain

### HuggingFace inference slow
- First request may take 20–30s (model loading)
- Subsequent requests are fast
- Check model status at https://huggingface.co/models

### Docker services not starting
- Run `docker compose logs api` to see error messages
- Ensure `.env.docker` has all required variables
- Make sure ports 3000, 8000, 5432, 6379 are free

---

*For security issues, see [SECURITY.md](../SECURITY.md) for responsible disclosure.*
