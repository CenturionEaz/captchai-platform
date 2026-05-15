# CaptchaIQ Security Architecture

## Secret Classification

| Variable | Classification | Location | Accessible By |
|----------|---------------|----------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | **PUBLIC** | `.env.local` | Browser + Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **PUBLIC** | `.env.local` | Browser + Server |
| `SUPABASE_SERVICE_ROLE_KEY` | **🔴 PRIVATE** | `.env.local` (server) | Server ONLY |
| `RESEND_API_KEY` | **🔴 PRIVATE** | `.env.local` (server) | Server ONLY |
| `HF_TOKEN` | **🔴 PRIVATE** | `.env.local` (server) | Server ONLY |
| `VERCEL_TOKEN` | **🔴 PRIVATE** | `.env.local` (never deploy) | CI ONLY |

## Auth Architecture

```
Browser
  │
  ├── Supabase client (anon key)
  │     ├── signInWithPassword()
  │     ├── signInWithOAuth()
  │     └── signOut()
  │
  │── Next.js Middleware (Edge)
  │     ├── Reads session cookie (sb-*-auth-token)
  │     ├── Calls supabase.auth.getUser() to validate
  │     ├── Protected prefixes: /dashboard, /api/v1
  │     ├── Redirects unauthenticated → /login?next=<intended>
  │     └── Injects security headers on every response
  │
  ├── Next.js Server Components
  │     └── createClient() from lib/supabase/server.ts
  │           Uses service role key for admin operations
  │
  └── FastAPI Backend
        └── get_current_user() dependency
              Calls Supabase /auth/v1/user with Bearer token
              Never trusts client-provided user data
```

## Security Headers Applied

Every response from the Next.js middleware includes:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; ...
```

## What Is Never Done

- ❌ Service role key sent to browser
- ❌ `NEXT_PUBLIC_` prefix on private keys
- ❌ Secrets committed to git
- ❌ Plaintext API keys stored in database
- ❌ Client-side trust of user IDs (server always validates)
- ❌ JWT secrets hardcoded in source code

## Rotation Checklist

Run after any suspected exposure:

```bash
# 1. Rotate Supabase anon + service role keys
#    Supabase Dashboard → Project Settings → API → Rotate

# 2. Rotate Resend key
#    resend.com → API Keys → Delete + Create new

# 3. Rotate HuggingFace token
#    huggingface.co → Settings → Access Tokens → Delete + Create new

# 4. Revoke Vercel token
#    vercel.com → Account Settings → Tokens → Delete + Create new

# 5. Update all environments:
#    - apps/web/.env.local
#    - .env.local (root)
#    - .env.docker
#    - Vercel environment variables
#    - Any Docker secrets
```

## Responsible Disclosure

Report security vulnerabilities to: security@captchaiq.dev

See [SECURITY.md](../SECURITY.md) for the full responsible disclosure policy.
