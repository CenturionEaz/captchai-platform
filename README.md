<!-- Banner -->
<div align="center">

<img src="docs/assets/banner.png" alt="CaptchaIQ Banner" width="100%">

# 🧠 CaptchaIQ Platform

### AI-Powered CAPTCHA Intelligence Research Platform

[![CI](https://github.com/CenturionEaz/captchai-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/CenturionEaz/captchai-platform/actions/workflows/ci.yml)
[![License: Custom Educational](https://img.shields.io/badge/License-Educational%20Research-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-green?logo=python)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-teal?logo=fastapi)](https://fastapi.tiangolo.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](./docker)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg)](./CONTRIBUTING.md)

**A production-grade, self-learning AI research environment for studying CAPTCHA robustness, adversarial machine learning, and accessibility.**

[🚀 Live Demo](#) · [📖 Documentation](#documentation) · [🔬 Research](#ai-pipeline) · [💬 Discussions](https://github.com/CenturionEaz/captchai-platform/discussions)

</div>

---

> ## ⚠️ IMPORTANT — Educational & Research Use Only
>
> This project is **strictly** for:
> - Educational AI/ML research and experimentation
> - Authorized security research and CAPTCHA robustness benchmarking
> - Accessibility research and alternative authentication studies
> - Portfolio demonstration and learning purposes
>
> **It must NOT be used to bypass CAPTCHA systems on third-party services without explicit written authorization.**
>
> By using this software, you accept the [LICENSE](./LICENSE), [ETHICS.md](./ETHICS.md), [DISCLAIMER.md](./DISCLAIMER.md), and [ACCEPTABLE_USE.md](./ACCEPTABLE_USE.md).

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Deployment](#deployment)
- [AI Pipeline](#ai-pipeline)
- [API Reference](#api-reference)
- [Browser Extension](#browser-extension)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [Legal](#legal)

---

## Overview

CaptchaIQ Platform is a **research-grade, production-quality** AI platform designed to study CAPTCHA mechanisms, train AI models for challenge analysis, and provide a rich analytics environment for understanding AI performance in adversarial settings.

It is built as a **portfolio-level project** demonstrating full-stack AI engineering, from ML model orchestration to real-time analytics dashboards, browser extensions, and cloud deployment — all wrapped in an enterprise-grade, cyberpunk-aesthetic UI.

### What Makes This Different

| Feature | CaptchaIQ | Typical Projects |
|---------|-----------|-----------------|
| Self-learning AI loop | ✅ Real retraining pipeline | ❌ Static models |
| Vector memory (pgvector) | ✅ Similarity search | ❌ None |
| Real-time WebSocket feed | ✅ Live streaming | ❌ Polling |
| Multi-model orchestration | ✅ 6 specialized models | ❌ Single model |
| Browser extension | ✅ Manifest V3 | ❌ None |
| Full monorepo | ✅ Turborepo + pnpm | ❌ Single repo |
| Production CI/CD | ✅ GitHub Actions | ❌ Manual |
| Ethical framework | ✅ Full legal docs | ❌ None |

---

## Features

### 🔬 CAPTCHA Research Engine
- **OCR Analysis** — Tesseract-powered text recognition with adaptive preprocessing
- **Image Classification** — CNN-based multi-class image grid analysis
- **Audio Transcription** — Whisper AI for audio CAPTCHA research
- **Slider Analysis** — OpenCV edge detection for gap localization
- **Behavioral Research** — Mouse/touch pattern analysis (experimental)
- **Auto-Detection** — Automatic challenge type classification

### 🧠 Self-Learning AI System
- **Mistake Memory** — Corrections fed back into training pipeline
- **Active Learning** — Human-in-the-loop labeling interface
- **Continuous Retraining** — Scheduled and threshold-triggered model updates
- **Vector Embeddings** — pgvector similarity search for challenge deduplication
- **Confidence Scoring** — Multi-model ensemble confidence evaluation
- **Fallback Routing** — Automatic fallback when primary model is uncertain

### 📊 Analytics Dashboard
- Real-time solve rate and confidence graphs
- Challenge type distribution (donut charts)
- AI learning curves (loss/accuracy over epochs)
- Activity heatmaps by hour and day
- Live activity feed via WebSocket
- Model performance radar charts
- Benchmarking comparisons

### 🌐 Multi-Platform
- **Web App** — Next.js 14 dashboard with full analytics
- **Browser Extension** — Chrome/Edge Manifest V3 research overlay
- **REST API** — Full FastAPI backend with OpenAPI docs
- **WebSocket** — Real-time event streaming

---

## Architecture

```
captchaiq-platform/
├── apps/
│   ├── web/                    # Next.js 14 dashboard
│   │   ├── src/app/            # App Router pages
│   │   │   ├── page.tsx        # Landing page
│   │   │   └── dashboard/      # Research dashboard
│   │   └── Dockerfile
│   ├── api/                    # FastAPI AI backend
│   │   ├── app/
│   │   │   ├── main.py         # App entrypoint
│   │   │   ├── api/v1/         # REST endpoints
│   │   │   ├── services/       # AI pipeline, learning engine
│   │   │   └── core/           # Config, auth, database
│   │   └── Dockerfile
│   └── extension/              # Chrome/Edge extension (MV3)
│       ├── manifest.json
│       ├── background.js
│       └── content/            # Content scripts & overlay
├── packages/
│   └── ai-engine/              # Shared Python ML library
├── supabase/
│   └── migrations/             # PostgreSQL schema + RLS
├── docker/
│   └── docker-compose.dev.yml
├── .github/
│   ├── workflows/              # CI, release, AI training
│   ├── ISSUE_TEMPLATE/
│   └── dependabot.yml
└── docs/                       # Full documentation
```

### System Flow

```
User Upload → Challenge Detector → Route to Pipeline
                                        │
              ┌─────────────────────────┤
              │         │         │     │
           [OCR]  [Vision]  [Audio] [Slider]
              │         │         │     │
              └─────────┬─────────┘─────┘
                        │
                 Confidence Scorer
                        │
              ┌──────────┴──────────┐
           High conf            Low conf
              │                     │
          Return Result         Fallback Model
              │                     │
         ┌────┴─────────────────────┘
         │
   Feedback Loop ──→ Corrections DB ──→ Retraining Queue
         │
   Vector Memory ──→ pgvector Index ──→ Similarity Search
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Recharts |
| **State** | Zustand |
| **Backend** | FastAPI, Python 3.11, asyncpg |
| **AI/ML** | Tesseract OCR, OpenCV, Whisper, HuggingFace Transformers |
| **Database** | Supabase (PostgreSQL 16 + pgvector) |
| **Auth** | Supabase Auth |
| **Queue** | Redis |
| **Extension** | Web Extensions API (Manifest V3) |
| **Monorepo** | Turborepo + pnpm workspaces |
| **CI/CD** | GitHub Actions |
| **Deployment** | Vercel (web), Docker (API), Supabase (DB) |
| **Observability** | Sentry, PostHog |

---

## Quick Start

### Prerequisites

> If you've never used Git, Node.js, or Python — don't worry! Follow each step exactly.

**Required:**
- [Node.js 20+](https://nodejs.org/en/download) — JavaScript runtime
- [Python 3.11+](https://python.org/downloads) — for the AI backend
- [pnpm](https://pnpm.io/installation) — fast package manager (`npm install -g pnpm`)
- [Git](https://git-scm.com/downloads) — version control
- [Docker Desktop](https://docker.com/products/docker-desktop) — containers (optional but recommended)

### Option A: Docker (Recommended — Easiest)

```bash
# 1. Clone the repository
git clone https://github.com/CenturionEaz/captchai-platform.git
cd captchaiq-platform

# 2. Copy environment template
cp .env.example .env.local

# 3. Edit .env.local and fill in your keys (see Environment Setup section)
# On Windows: notepad .env.local
# On Mac/Linux: nano .env.local

# 4. Start everything with Docker
docker compose -f docker/docker-compose.dev.yml up -d

# 5. Open the app
# Web Dashboard: http://localhost:3000
# API Docs:      http://localhost:8000/docs
# Database GUI:  http://localhost:8080
```

### Option B: Manual Setup

```bash
# 1. Clone
git clone https://github.com/CenturionEaz/captchai-platform.git
cd captchaiq-platform

# 2. Install Node dependencies
pnpm install

# 3. Set up Python backend
cd apps/api
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
cd ../..

# 4. Copy and configure environment
cp .env.example .env.local
# Fill in your values (see Environment Setup)

# 5. Start development servers
pnpm dev          # Starts both Next.js and other Node apps
# In a separate terminal:
cd apps/api && uvicorn app.main:app --reload
```

### Environment Setup

You need accounts at these free services:

#### 1. Supabase (Database + Auth) — Free
1. Go to [supabase.com](https://supabase.com) → Sign up → Create new project
2. Go to **Project Settings → API**
3. Copy **Project URL** → paste into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`
4. Copy **anon public** key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy **service_role** key → paste as `SUPABASE_SERVICE_KEY`
6. Go to **SQL Editor** → paste contents of `supabase/migrations/001_initial_schema.sql` → Run

#### 2. Secret Key — Generate Locally
```bash
# Generate a secure secret key
python -c "import secrets; print(secrets.token_hex(32))"
# Paste the output into SECRET_KEY in .env.local
```

#### 3. HuggingFace (Optional — for advanced models)
1. Sign up at [huggingface.co](https://huggingface.co)
2. Go to Settings → Access Tokens → New token (read)
3. Paste into `HF_TOKEN`

---

## Deployment

### Deploy to Vercel (Web App)

Vercel is the easiest way to deploy the Next.js frontend for free.

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/captchaiq-platform.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com) → Sign in with GitHub
   - Click **Add New → Project**
   - Import your `captchaiq-platform` repository
   - Set **Root Directory** to `apps/web`
   - Add **Environment Variables** (copy from `.env.local`)
   - Click **Deploy** ✅

3. **Your site is live!** Copy the URL Vercel gives you.

### Deploy API to Railway / Render

For the FastAPI backend, use [Railway](https://railway.app) or [Render](https://render.com):

**Railway (Recommended):**
1. Go to [railway.app](https://railway.app) → New Project → GitHub Repo
2. Select `captchaiq-platform` → Set Root Directory to `apps/api`
3. Add the same environment variables from `.env.local`
4. Railway auto-detects the `Dockerfile` and deploys ✅

---

## AI Pipeline

The CaptchaIQ AI pipeline is a multi-model orchestration system:

```
Input Challenge
      │
      ▼
Challenge Detector (captchaiq-detector-v1)
  Accuracy: 98.4% | Classifies: image/ocr/audio/slider/behavioral
      │
      ├──[image]──▶ Vision Pipeline
      │              ├─ Resize & normalize
      │              ├─ CNN feature extraction
      │              └─ Multi-class classification
      │
      ├──[ocr]────▶ OCR Pipeline  
      │              ├─ Grayscale + 3x upscale
      │              ├─ Gaussian blur
      │              ├─ Otsu thresholding
      │              ├─ Morphological cleanup
      │              └─ Tesseract (PSM 7, OEM 3)
      │
      ├──[audio]──▶ Audio Pipeline
      │              ├─ Load & normalize audio
      │              ├─ Noise reduction (noisereduce)
      │              └─ Whisper transcription
      │
      ├──[slider]─▶ Slider Pipeline
      │              ├─ Grayscale conversion
      │              ├─ Canny edge detection
      │              ├─ Contour detection
      │              └─ Gap localization
      │
      └──[behavioral]▶ Behavioral Pipeline (experimental)
                       └─ Event sequence analysis

      ▼
Confidence Scorer
  < threshold → Fallback model
  ≥ threshold → Return result
      │
      ▼
Learning Loop
  Correction feedback → Training queue
  Vector embedding → pgvector memory
```

---

## API Reference

Full interactive API docs available at `http://localhost:8000/docs` when running locally.

### Key Endpoints

```
POST /api/v1/analysis/analyze     Upload & analyze a challenge
POST /api/v1/analysis/feedback    Submit correction for learning
GET  /api/v1/analysis/types       List supported challenge types

GET  /api/v1/models               List all AI models
GET  /api/v1/models/{id}          Model details + metrics

GET  /api/v1/analytics/overview   Dashboard summary stats
GET  /api/v1/analytics/series     Time-series data

POST /api/v1/learning/retrain     Trigger manual retraining
GET  /api/v1/learning/history     Training run history

WS   /api/v1/ws/feed              Real-time activity WebSocket
```

---

## Browser Extension

The Chrome/Edge extension provides a research overlay when visiting pages with CAPTCHA challenges.

### Installation (Developer Mode)

1. Build the extension: `pnpm --filter extension build`
2. Open Chrome → `chrome://extensions/`
3. Enable **Developer Mode** (top right toggle)
4. Click **Load unpacked** → select `apps/extension/dist/`
5. The CaptchaIQ icon appears in your toolbar

> ⚠️ **Research Mode Only**: The extension is designed for analysis of challenges on **your own systems or authorized test environments only.** It does not automatically interact with or solve challenges on third-party sites.

---

## Contributing

We welcome contributions! Please read:

1. [CONTRIBUTING.md](./CONTRIBUTING.md) — full guide
2. [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
3. [ETHICS.md](./ETHICS.md) — required reading

Quick contribution steps:
```bash
git checkout -b feature/your-feature
# make your changes
pnpm lint && pnpm test
git commit -m "feat: your feature description"
git push origin feature/your-feature
# Open PR on GitHub
```

---

## Roadmap

### v1.1 (Next Release)
- [ ] Federated learning aggregation
- [ ] HuggingFace model fine-tuning UI
- [ ] Electron desktop application
- [ ] Firefox extension support

### v1.2
- [ ] CLI developer tooling (`captchaiq analyze`, `captchaiq benchmark`)
- [ ] Prometheus/Grafana observability stack
- [ ] YOLO-based image segmentation pipeline
- [ ] API key management dashboard

### v2.0
- [ ] Kubernetes Helm chart deployment
- [ ] Distributed training support
- [ ] Multi-tenant research workspace
- [ ] Public research dataset registry

---

## Legal

| Document | Purpose |
|----------|---------|
| [LICENSE](./LICENSE) | Custom Educational Research License |
| [DISCLAIMER.md](./DISCLAIMER.md) | Liability disclaimer |
| [ETHICS.md](./ETHICS.md) | Ethical use policy |
| [ACCEPTABLE_USE.md](./ACCEPTABLE_USE.md) | What you may/may not do |
| [SECURITY.md](./SECURITY.md) | Responsible disclosure |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Community standards |

---

<div align="center">

**Copyright (c) 2024 Pratyaksh — All Rights Reserved**

Built with ❤️ for AI research, accessibility, and education.

*This README and project must not be claimed as original work by others.*

</div>
