-- CaptchaIQ Platform — Phase 2 Extended Schema
-- Migration 002: Authentication, Datasets, Training, Benchmarks
-- Run AFTER 001_initial_schema.sql

-- ─── New Enum Types ────────────────────────────────────────────────────────
CREATE TYPE job_status AS ENUM ('queued', 'running', 'complete', 'failed', 'paused', 'cancelled');
CREATE TYPE dataset_type AS ENUM ('training', 'validation', 'adversarial', 'benchmark');
CREATE TYPE api_key_scope AS ENUM ('read', 'write', 'admin');

-- ─── Organizations ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.organizations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  plan        TEXT DEFAULT 'free' CHECK (plan IN ('free', 'research', 'enterprise')),
  owner_id    UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Organization Members ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.org_members (
  org_id      UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role        TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);

-- ─── Projects ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  settings    JSONB DEFAULT '{}',
  created_by  UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Datasets ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.datasets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id      UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  type            dataset_type NOT NULL,
  challenge_type  challenge_type,
  sample_count    INT DEFAULT 0,
  storage_path    TEXT,
  metadata        JSONB DEFAULT '{}',
  -- Generation parameters if synthetic
  gen_config      JSONB,
  is_synthetic    BOOLEAN DEFAULT FALSE,
  created_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Generated CAPTCHAs ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.generated_captchas (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_id      UUID REFERENCES public.datasets(id) ON DELETE CASCADE,
  challenge_type  challenge_type NOT NULL,
  label           TEXT,                          -- ground truth
  storage_path    TEXT NOT NULL,                 -- object storage path
  file_hash       TEXT,
  gen_config      JSONB DEFAULT '{}',
  embedding       vector(512),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── API Keys ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.api_keys (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  key_hash        TEXT NOT NULL UNIQUE,          -- SHA-256, never store plaintext
  key_prefix      TEXT NOT NULL,                 -- First 12 chars for display
  scope           api_key_scope DEFAULT 'read',
  last_used_at    TIMESTAMPTZ,
  request_count   BIGINT DEFAULT 0,
  revoked_at      TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Training Jobs ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.training_jobs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id        TEXT REFERENCES public.ai_models(model_id),
  dataset_id      UUID REFERENCES public.datasets(id),
  user_id         UUID REFERENCES public.profiles(id),
  status          job_status DEFAULT 'queued',
  trigger         TEXT DEFAULT 'manual',         -- 'manual' | 'scheduled' | 'threshold'
  config          JSONB DEFAULT '{}',            -- hyperparameters
  progress        FLOAT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  epoch_current   INT DEFAULT 0,
  epoch_total     INT,
  accuracy_before FLOAT,
  accuracy_after  FLOAT,
  loss_curve      JSONB DEFAULT '[]',            -- [{epoch, loss, accuracy}]
  error_message   TEXT,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Model Versions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.model_versions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id        TEXT REFERENCES public.ai_models(model_id),
  version         TEXT NOT NULL,
  training_job_id UUID REFERENCES public.training_jobs(id),
  accuracy        FLOAT,
  loss            FLOAT,
  artifact_path   TEXT,                          -- HuggingFace repo path
  promoted_to_prod BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Benchmark Runs ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.benchmark_runs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT,
  dataset_id      UUID REFERENCES public.datasets(id),
  user_id         UUID REFERENCES public.profiles(id),
  models_tested   TEXT[],
  results         JSONB DEFAULT '{}',            -- {model_id: {accuracy, latency, ...}}
  summary         JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Adversarial Tests ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.adversarial_tests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id     UUID REFERENCES public.analyses(id),
  attack_type     TEXT,                          -- 'fgsm' | 'pgd' | 'noise' | 'synthetic'
  epsilon         FLOAT,
  model_fooled    BOOLEAN,
  original_conf   FLOAT,
  adversarial_conf FLOAT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Audit Log ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_log (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,                    -- 'analyze.create' | 'model.update' | 'key.revoke'
  resource    TEXT,
  resource_id TEXT,
  metadata    JSONB DEFAULT '{}',
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Extension Sessions ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.extension_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  extension_id    TEXT,
  browser         TEXT,
  detected_count  INT DEFAULT 0,
  analysis_count  INT DEFAULT 0,
  last_active_at  TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Feature Flags ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feature_flags (
  key             TEXT PRIMARY KEY,
  enabled         BOOLEAN DEFAULT FALSE,
  rollout_pct     FLOAT DEFAULT 0,              -- 0–100 rollout percentage
  description     TEXT,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Additional Indexes ───────────────────────────────────────────────────
CREATE INDEX idx_training_jobs_user ON public.training_jobs(user_id);
CREATE INDEX idx_training_jobs_status ON public.training_jobs(status);
CREATE INDEX idx_datasets_project ON public.datasets(project_id);
CREATE INDEX idx_api_keys_user ON public.api_keys(user_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_audit_log_user ON public.audit_log(user_id, created_at DESC);
CREATE INDEX idx_generated_captchas_dataset ON public.generated_captchas(dataset_id);

-- HNSW vector index for generated CAPTCHAs
CREATE INDEX idx_generated_captchas_embedding ON public.generated_captchas
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ─── Row Level Security ───────────────────────────────────────────────────
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmark_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- API Keys: users manage their own
CREATE POLICY "Users manage own api keys" ON public.api_keys FOR ALL USING (auth.uid() = user_id);

-- Training Jobs: users see their own
CREATE POLICY "Users view own training jobs" ON public.training_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create training jobs" ON public.training_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Datasets: users see their own or org-shared
CREATE POLICY "Users view own datasets" ON public.datasets FOR SELECT USING (auth.uid() = created_by);

-- Feature Flags: public read
CREATE POLICY "Feature flags public read" ON public.feature_flags FOR SELECT USING (true);

-- ─── Seed Feature Flags ────────────────────────────────────────────────────
INSERT INTO public.feature_flags (key, enabled, rollout_pct, description) VALUES
  ('generator_v2', true, 100, 'CAPTCHA Generator v2 with adversarial controls'),
  ('lab_compare', true, 100, 'Model comparison in Research Lab'),
  ('websocket_feed', true, 100, 'Real-time WebSocket activity feed'),
  ('vector_search', true, 100, 'pgvector similarity search in analyses'),
  ('federated_learning', false, 0, 'Federated learning aggregation (Phase 3)')
ON CONFLICT (key) DO NOTHING;

-- ─── Triggers ─────────────────────────────────────────────────────────────
CREATE TRIGGER set_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_datasets_updated_at BEFORE UPDATE ON public.datasets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
