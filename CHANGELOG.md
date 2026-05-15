# Changelog

All notable changes to CaptchaIQ Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] — 2024-05-16 — Phase 2 Major Expansion

### ⚠️ Breaking Changes
- Dashboard layout now requires `@/components/command-palette` and `@/components/notification-panel`
- Navigation sidebar updated — `/dashboard/pipeline` replaced by `/dashboard/generator` and `/dashboard/lab`
- Next.js upgraded from 14 to 15 — see [migration guide](./docs/migration/v1-to-v2.md)
- API router extended with `/training`, `/generator` prefixes

### Added
#### Authentication
- `/login` page — email/password + GitHub + Google OAuth, research notice
- `/signup` page — registration with password strength meter + ethics acknowledgment
- JWT refresh token flow architecture (wire to Supabase Auth)
- User dropdown in topbar with settings and sign out

#### CAPTCHA Generator
- `/dashboard/generator` — Full synthetic CAPTCHA generation engine
- Real-time canvas rendering: OCR, distorted text, slider, image-select, adversarial types
- Distortion controls: level, noise, rotation, blur, font size, color scheme, font family
- Batch generation: ×1, ×10, ×50, ×100 samples
- Per-image download + bulk export (all generated samples)
- Adversarial strength slider for adversarial CAPTCHA type
- Dataset stats panel with generation count, type, distortion

#### Research Lab
- `/dashboard/lab` — Interactive AI research playground
- Drag-and-drop file upload with image preview
- Multi-model selection panel (all 5 models, select any combination)
- Pipeline execution visualization with step-by-step stage tracking
- Side-by-side model comparison with confidence bars and latency
- Benchmark history tab with multi-line area chart
- Three tabs: Pipeline, Compare, History

#### Command Palette
- Global `⌘K` / `Ctrl+K` keyboard shortcut
- Fuzzy search across all commands, pages, models
- Keyboard navigation (↑↓ to move, ↵ to open, ESC to close)
- Grouped categories: Navigate, Account, Help
- Animated backdrop blur overlay

#### Notification Panel
- Bell icon with unread count badge
- 5 notification types: success, error, warning, info, ai
- Mark all read, dismiss individual notifications
- Type-appropriate icons and color coding

#### Settings
- `/dashboard/settings` — Full multi-tab settings page
  - **Profile**: display name, username, email, bio, institution, avatar upload
  - **Appearance**: dark/light/system theme, accent color, sidebar position
  - **Notifications**: granular toggles for all notification categories
  - **API Keys**: generate, view/hide, copy, revoke keys with request counts
  - **Security**: password change, 2FA setup, active session management

#### Training Jobs
- `/dashboard/training` — Training job management dashboard
- Expandable job cards with epoch, accuracy, loss, samples metrics
- Loss curve chart (multi-model, 10-epoch window)
- KPI counts: active, queued, complete, failed
- Job actions: pause, retry, run now, view logs
- API: POST /training/jobs, GET /training/jobs, PATCH pause/retry

#### Backend Additions
- `/api/v1/training/jobs` — Full training job CRUD with background execution simulation
- `/api/v1/generator/generate` — Synthetic CAPTCHA generation endpoint
- `/api/v1/generator/zip` — Bulk dataset ZIP download endpoint
- Extended router with training and generator prefixes

#### Database
- Migration `002_phase2_schema.sql`:
  - New tables: organizations, org_members, projects, datasets, generated_captchas, api_keys, training_jobs, model_versions, benchmark_runs, adversarial_tests, audit_log, extension_sessions, feature_flags
  - HNSW vector index on `generated_captchas.embedding`
  - RLS policies on all new tables
  - Seed data for 5 feature flags

#### DevOps & Infrastructure
- Upgraded CI workflow with Playwright E2E tests
- PR preview deployments with automated comment (Vercel URL)
- `docker-compose.prod.yml` — production-grade compose with nginx, certbot SSL, watchtower
- Resource limits and rolling update strategy on API service
- pip-audit in CI security scan
- CSS Phase 2 additions: select theming, range slider, scan-line animation, frosted panel, glow text

### Changed
- Dashboard layout upgraded: command palette, notification panel, user dropdown, all Phase 2 nav items
- Sidebar now shows "RESEARCH v2" badge
- Topbar search now opens command palette instead of inline search
- Dashboard `nav_sections` expanded with Generator, Lab, Training Jobs
- `globals.css` extended with Phase 2 utility classes

### Fixed
- Topbar notification bell now connects to real `NotificationPanel` component
- Dashboard layout properly handles `useEffect` for keyboard shortcut registration

---

## [1.0.0] — 2024-05-15 — Initial Release

### Added
- Full monorepo structure (Turborepo + pnpm workspaces)
- Next.js 14 web application with cyberpunk design system
- FastAPI Python backend with AI pipeline service
- 6 dashboard pages: Overview, Analyze, Learning Engine, Model Registry, Analytics
- Supabase PostgreSQL schema with pgvector + RLS policies
- Docker Compose development environment
- 3 GitHub Actions workflows: CI, Release, AI Training
- Chrome/Edge browser extension (Manifest V3) with challenge detector
- Complete legal/ethics documentation (LICENSE, DISCLAIMER, ETHICS, ACCEPTABLE_USE, SECURITY)
- Professional README with architecture, setup guide, and deployment docs
- OCR, Vision, Slider, Audio, Behavioral AI pipeline modules
- Real-time WebSocket endpoint architecture
- Mistake memory system with pgvector similarity search

---

[2.0.0]: https://github.com/OWNER/captchaiq-platform/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/OWNER/captchaiq-platform/releases/tag/v1.0.0
