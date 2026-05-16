# CaptchaIQ Platform — Complete Deployment Guide

> **Zero to deployed in ~30 minutes.** This guide assumes you know nothing about deployment.
> Follow every step in order.

---

## What You're Deploying

| Service | Platform | Cost | Purpose |
|---------|----------|------|---------|
| Frontend (Next.js) | Vercel | Free | The web app users see |
| Backend (FastAPI) | Render | Free | The AI API |
| Database + Auth | Supabase | Free | Users, data, sessions |
| AI Models | HuggingFace | Free | OCR, image classification, audio |

---

## Step 1 — Supabase Setup

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → **Start for free**
2. Sign up / sign in
3. Click **New project**
4. Fill in:
   - **Name**: `captchaiq`
   - **Database password**: something strong (save it!)
   - **Region**: choose closest to you
5. Wait ~2 minutes for the project to provision

### 1.2 Get Your API Keys

1. In your project, click **Project Settings** (gear icon, bottom left)
2. Click **API**
3. Copy these values — you'll need them later:

```
Project URL:        https://XXXXXXXXXXXX.supabase.co
anon public key:    eyJh...  (long string, safe to expose to browser)
service_role key:   eyJh...  (KEEP THIS SECRET — never put in frontend)
```

### 1.3 Enable Email Auth

1. In Supabase, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled (it is by default)
3. Optional: enable **GitHub** OAuth under Providers → GitHub

### 1.4 Run the Database Schema

1. Go to **SQL Editor** in Supabase
2. Click **New query**
3. Paste and run this SQL:

```sql
-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- User profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  role text default 'researcher',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Users can only read/update their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

Click **Run** — you should see "Success. No rows returned."

---

## Step 2 — HuggingFace Token

### 2.1 Create a Free Account

1. Go to [huggingface.co](https://huggingface.co) → **Sign Up**
2. Verify your email

### 2.2 Create an Access Token

1. Click your avatar → **Settings**
2. Click **Access Tokens** in the left sidebar
3. Click **New token**
4. Name it `captchaiq`, role = **Read**
5. Click **Generate a token**
6. Copy the token (starts with `hf_...`) — you'll need it for Render

---

## Step 3 — Deploy Backend to Render

### 3.1 Create a Render Account

1. Go to [render.com](https://render.com) → **Get Started for Free**
2. Sign up with GitHub (easiest — lets Render access your repo)

### 3.2 Create a New Web Service

1. In Render dashboard, click **New** → **Web Service**
2. Connect your GitHub repo (`captcha` / `CenturionEaz/captchai-platform`)
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `captchaiq-api` |
| **Region** | Oregon (US West) |
| **Branch** | `main` |
| **Root Directory** | `apps/api` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1 --loop asyncio` |
| **Instance Type** | **Free** |

4. Click **Advanced** → **Health Check Path**: `/health`

### 3.3 Add Environment Variables

In Render, scroll to **Environment Variables** and add each one:

| Key | Value |
|-----|-------|
| `ENVIRONMENT` | `production` |
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | your Supabase service role key |
| `HF_TOKEN` | your HuggingFace token (starts with `hf_`) |
| `ALLOWED_ORIGINS` | `["https://your-app.vercel.app","http://localhost:3000"]` |
| `SECRET_KEY` | click **Generate** for a random secure value |

> ⚠️ **Important**: Update `ALLOWED_ORIGINS` with your actual Vercel URL **after** Step 4.

### 3.4 Deploy

1. Click **Create Web Service**
2. Wait 3–5 minutes for the first build
3. Once deployed, your API URL looks like: `https://captchaiq-api.onrender.com`
4. Test it: open `https://captchaiq-api.onrender.com/health` in your browser
   - You should see: `{"status":"healthy","version":"1.0.0","environment":"production"}`

> **Note**: Free Render instances **sleep after 15 minutes of inactivity** and take ~30 seconds to wake up on the first request. This is normal for the free plan.

---

## Step 4 — Deploy Frontend to Vercel

### 4.1 Create a Vercel Account

1. Go to [vercel.com](https://vercel.com) → **Sign Up**
2. Sign up with GitHub

### 4.2 Import Your Repository

1. In Vercel dashboard, click **Add New** → **Project**
2. Import your GitHub repo (`CenturionEaz/captchai-platform`)
3. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js (auto-detected) |
| **Root Directory** | `apps/web` |
| **Build Command** | `next build` (leave as default) |
| **Output Directory** | `.next` (leave as default) |
| **Install Command** | `pnpm install` |

### 4.3 Add Environment Variables

Click **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key |
| `NEXT_PUBLIC_API_URL` | `https://captchaiq-api.onrender.com` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` (fill after deploy) |

### 4.4 Deploy

1. Click **Deploy**
2. Wait ~2 minutes for the build
3. Your app URL looks like: `https://captchaiq-abc123.vercel.app`

### 4.5 Update CORS on Render

Now that you have your Vercel URL:

1. Go to Render → your service → **Environment**
2. Update `ALLOWED_ORIGINS` to:
   ```
   ["https://captchaiq-abc123.vercel.app","http://localhost:3000"]
   ```
3. Click **Save Changes** — Render will redeploy automatically

---

## Step 5 — Test Everything

Open your Vercel URL and check:

- [ ] Home page loads with no errors
- [ ] Click **Sign Up** — create an account
- [ ] You get redirected to `/dashboard`
- [ ] Dashboard shows analytics cards
- [ ] Navigate to **Generator** — generate a CAPTCHA sample
- [ ] Navigate to **Training** — create a training job
- [ ] Open browser devtools → **Network** tab — API calls to Render should return 200

---

## Troubleshooting

### "502 Bad Gateway" from Render
- The free instance is sleeping — wait 30 seconds and try again
- Check Render logs: Dashboard → your service → **Logs**

### "CORS error" in browser console
- Your `ALLOWED_ORIGINS` on Render doesn't include your Vercel URL
- Update it and trigger a redeploy

### "Invalid Supabase URL" or auth not working
- Double-check `NEXT_PUBLIC_SUPABASE_URL` — it must be `https://XXXX.supabase.co` (no trailing slash)
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the **anon** key, not the service role key

### Next.js build fails on Vercel
- Check the **Build Logs** in Vercel for the exact error
- Run `pnpm build` locally first to catch TypeScript/ESLint errors

### HuggingFace API returns 503
- This means the model is loading (cold start) — retry after 20 seconds
- The app handles this gracefully with fallback responses

### Free tier limits
| Service | Limit | What happens |
|---------|-------|--------------|
| Render | 750 hrs/month, 512MB RAM | Service sleeps after inactivity |
| Supabase | 500MB DB, 2GB bandwidth | Requests fail if exceeded |
| HuggingFace | Rate limited | App uses demo responses as fallback |
| Vercel | 100GB bandwidth | Build/deploy fails if exceeded |

---

## Local Development

```bash
# 1. Clone the repo
git clone https://github.com/CenturionEaz/captchai-platform
cd captchai-platform

# 2. Install Node dependencies
pnpm install

# 3. Set up frontend env
cp .env.example apps/web/.env.local
# Edit apps/web/.env.local with your Supabase + API values

# 4. Set up backend env
cp .env.example apps/api/.env
# Edit apps/api/.env with your Supabase + HF values

# 5. Run frontend (terminal 1)
cd apps/web
pnpm dev
# → http://localhost:3000

# 6. Run backend (terminal 2)
cd apps/api
pip install -r requirements.txt
uvicorn app.main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI)
```

---

## Architecture Overview

```
Browser
  │
  ├── Vercel (Next.js)
  │     ├── /app/page.tsx        → Landing page
  │     ├── /app/dashboard/*     → Protected dashboard (requires auth)
  │     ├── /app/login           → Supabase auth login
  │     └── /middleware.ts       → Auth guard (redirects unauthenticated users)
  │
  └── Render (FastAPI)
        ├── GET  /health         → Health check (Render uses this)
        ├── POST /api/v1/auth/*  → Auth via Supabase
        ├── POST /api/v1/analysis/analyze  → CAPTCHA analysis
        ├── POST /api/v1/generator/generate → Synthetic CAPTCHA generation
        ├── GET  /api/v1/models  → Model catalog
        ├── GET  /api/v1/analytics/overview → Dashboard stats
        ├── POST /api/v1/learning/feedback  → Correction submission
        ├── POST /api/v1/training/jobs      → Training job management
        └── WS   /api/v1/ws/progress/{id}  → Real-time training progress

Database: Supabase (PostgreSQL + Auth + Storage)
AI: HuggingFace Inference API (no local GPU needed)
```
