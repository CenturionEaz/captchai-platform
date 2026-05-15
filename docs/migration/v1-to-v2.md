# v1 → v2 Migration Guide

This guide covers all breaking changes and required steps when upgrading from CaptchaIQ v1 to v2.

---

## Overview

v2 is a **non-destructive** upgrade. All existing pages, routes, and API endpoints continue to work. v2 adds new routes and components on top of the existing foundation.

---

## 1. Update Dependencies

```bash
# In apps/web
npm install next@latest react@latest react-dom@latest

# Verify version
npx next --version  # Should show 15.x
```

---

## 2. Dashboard Layout

The `apps/web/src/app/dashboard/layout.tsx` file was **upgraded** (not replaced). If you have a custom fork, you need to:

1. Add the two new component imports:

```tsx
import { CommandPalette } from "@/components/command-palette";
import { NotificationPanel } from "@/components/notification-panel";
```

2. Add `Sparkles` and `FlaskConical` to lucide-react imports.

3. Add `⌘K` keyboard handler in the root layout component:

```tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setCmdOpen((v) => !v);
    }
  };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, []);
```

---

## 3. New Files to Add

Create these component files (copy from the repository):

| File | Purpose |
|------|---------|
| `src/components/command-palette.tsx` | Global ⌘K command palette |
| `src/components/notification-panel.tsx` | Notification bell panel |

---

## 4. Database Migration

Run the Phase 2 migration **after** the v1 schema is already in place:

```sql
-- In Supabase SQL Editor
-- Paste contents of:
-- supabase/migrations/002_phase2_schema.sql
```

> **Important:** Run migrations in order. `002` depends on tables created in `001`.

---

## 5. New Routes

These new routes were added in v2. No action needed — they just work:

| Route | Page |
|-------|------|
| `/login` | Authentication page |
| `/signup` | Registration page |
| `/dashboard/generator` | CAPTCHA Generator |
| `/dashboard/lab` | Research Lab |
| `/dashboard/training` | Training Jobs |
| `/dashboard/settings` | Settings |

---

## 6. Navigation Update

The sidebar navigation was updated. If you have a hardcoded nav, update it:

**Removed:**
- `/dashboard/pipeline` (AI Pipeline)

**Added:**
- `/dashboard/generator` (CAPTCHA Generator)
- `/dashboard/lab` (Research Lab)
- `/dashboard/training` (Training Jobs)

---

## 7. API Router

Two new prefixes were added to `apps/api/app/api/v1/router.py`:

```python
from app.api.v1.endpoints import training, generator

api_router.include_router(training.router, prefix="/training", tags=["Training"])
api_router.include_router(generator.router, prefix="/generator", tags=["Generator"])
```

Add these two lines to your existing router file.

---

## 8. Environment Variables

No new required variables. Optional additions:

```env
# Phase 2 optional additions to .env.local

# Redis password (if using production compose)
REDIS_PASSWORD=your-redis-password

# Admin email (for certbot SSL in production)
ADMIN_EMAIL=admin@yourdomain.com
```

---

## 9. CSS Additions

If you have a custom `globals.css`, append the Phase 2 block from the end of the current `globals.css` (the `/* ─── Phase 2 Additions ─────── */` section).

Key additions: `select.input-field` styling, `input[type="range"]` styling, `.scan-line`, `.frosted`, `.glow-cyan`, `.glow-purple`.

---

## 10. Docker Production Upgrade

The new `docker/docker-compose.prod.yml` replaces the previous manual production setup. Key changes:

- Added nginx reverse proxy with SSL support
- Added certbot for Let's Encrypt certificates
- Added watchtower for auto-updates
- API now runs 2 replicas with rolling update strategy
- Redis now requires password in production

---

## Rollback Plan

If you need to roll back to v1:

1. Revert `apps/web/src/app/dashboard/layout.tsx` to the v1 version (git checkout)
2. Remove new page directories: `generator/`, `lab/`, `training/`, `settings/`, and auth pages
3. Remove `src/components/command-palette.tsx` and `notification-panel.tsx`
4. The Phase 2 DB migration (`002_phase2_schema.sql`) is additive — existing v1 data is unaffected
5. Do NOT run `002_phase2_schema.sql` on rollback unless you need those tables

---

*Questions? Open a GitHub Discussion or see [CONTRIBUTING.md](./CONTRIBUTING.md).*
