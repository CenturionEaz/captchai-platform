-- CaptchaIQ Platform — Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor to set up the database
-- Version: 1.0.0

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";       -- pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- fuzzy text search

-- ─── Enum Types ───────────────────────────────────────────────────────────────
CREATE TYPE challenge_type AS ENUM (
  'image', 'ocr', 'audio', 'slider', 'behavioral', 'unknown'
);

CREATE TYPE analysis_status AS ENUM (
  'pending', 'processing', 'complete', 'failed', 'fallback'
);

CREATE TYPE model_status AS ENUM (
  'production', 'beta', 'experimental', 'deprecated'
);

-- ─── Users (extends Supabase auth.users) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     TEXT UNIQUE,
  display_name TEXT,
  role         TEXT DEFAULT 'researcher' CHECK (role IN ('researcher', 'admin', 'viewer')),
  api_key_hash TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AI Models Registry ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_models (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id       TEXT UNIQUE NOT NULL,
  name           TEXT NOT NULL,
  version        TEXT NOT NULL,
  challenge_type challenge_type,
  status         model_status DEFAULT 'beta',
  accuracy       FLOAT CHECK (accuracy BETWEEN 0 AND 1),
  size_mb        FLOAT,
  description    TEXT,
  tags           TEXT[],
  config         JSONB DEFAULT '{}',
  hf_repo        TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Analyses ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.analyses (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  model_id         TEXT REFERENCES public.ai_models(model_id),
  challenge_type   challenge_type NOT NULL,
  status           analysis_status DEFAULT 'pending',
  
  -- Input metadata
  file_hash        TEXT,                          -- SHA-256 of uploaded file (no raw data stored)
  file_size_bytes  INT,
  content_type     TEXT,
  
  -- Results
  prediction       TEXT,
  confidence       FLOAT CHECK (confidence BETWEEN 0 AND 1),
  alternatives     JSONB DEFAULT '[]',
  pipeline_steps   TEXT[],
  processing_ms    INT,
  
  -- Embedding for similarity search
  embedding        vector(512),
  
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Corrections / Feedback ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.corrections (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id    UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
  user_id        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  correct_label  TEXT NOT NULL,
  original_pred  TEXT,
  confidence_gap FLOAT,                           -- how wrong was the model
  ingested_at    TIMESTAMPTZ,                     -- when added to training set
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Training Runs ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.training_runs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id        TEXT REFERENCES public.ai_models(model_id),
  triggered_by    TEXT,                           -- 'scheduled' | 'manual' | 'threshold'
  sample_count    INT,
  accuracy_before FLOAT,
  accuracy_after  FLOAT,
  loss_before     FLOAT,
  loss_after      FLOAT,
  duration_s      INT,
  status          TEXT DEFAULT 'running',
  notes           TEXT,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

-- ─── Vector Memory Store ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vector_memories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
  embedding   vector(512) NOT NULL,
  label       TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Activity Feed ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_events (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  title      TEXT NOT NULL,
  metadata   JSONB DEFAULT '{}',
  user_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── System Metrics (time-series) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id             BIGSERIAL PRIMARY KEY,
  metric_name    TEXT NOT NULL,
  metric_value   FLOAT NOT NULL,
  labels         JSONB DEFAULT '{}',
  recorded_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX idx_analyses_challenge_type ON public.analyses(challenge_type);
CREATE INDEX idx_corrections_analysis_id ON public.corrections(analysis_id);
CREATE INDEX idx_training_runs_model_id ON public.training_runs(model_id);
CREATE INDEX idx_activity_events_created_at ON public.activity_events(created_at DESC);
CREATE INDEX idx_system_metrics_name_time ON public.system_metrics(metric_name, recorded_at DESC);

-- Vector similarity search index (HNSW)
CREATE INDEX idx_vector_memories_embedding ON public.vector_memories
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX idx_analyses_embedding ON public.analyses
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vector_memories ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Analyses: users can CRUD their own analyses
CREATE POLICY "Users can view own analyses" ON public.analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create analyses" ON public.analyses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Corrections: users can submit corrections for their own analyses
CREATE POLICY "Users can create corrections" ON public.corrections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own corrections" ON public.corrections FOR SELECT USING (auth.uid() = user_id);

-- AI Models: public read
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Models are publicly readable" ON public.ai_models FOR SELECT USING (true);
CREATE POLICY "Only admins can modify models" ON public.ai_models FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Activity events: public read
CREATE POLICY "Activity events are publicly readable" ON public.activity_events FOR SELECT USING (true);

-- ─── Helper Functions ─────────────────────────────────────────────────────────

-- Find similar challenges by vector embedding
CREATE OR REPLACE FUNCTION find_similar_challenges(
  query_embedding vector(512),
  match_count INT DEFAULT 10,
  similarity_threshold FLOAT DEFAULT 0.8
)
RETURNS TABLE (
  id UUID,
  prediction TEXT,
  confidence FLOAT,
  similarity FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.prediction,
    a.confidence,
    1 - (a.embedding <=> query_embedding) AS similarity
  FROM public.analyses a
  WHERE a.embedding IS NOT NULL
    AND 1 - (a.embedding <=> query_embedding) > similarity_threshold
  ORDER BY a.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_models_updated_at BEFORE UPDATE ON public.ai_models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Seed Data ────────────────────────────────────────────────────────────────
INSERT INTO public.ai_models (model_id, name, version, challenge_type, status, accuracy, size_mb, description, tags)
VALUES
  ('captchaiq-vision-v2', 'CaptchaIQ Vision', '2.0', 'image', 'production', 0.942, 287, 'Multi-scale CNN image grid classifier', ARRAY['image', 'cnn', 'classification']),
  ('captchaiq-ocr-v3', 'CaptchaIQ OCR', '3.0', 'ocr', 'production', 0.917, 142, 'Tesseract-enhanced distorted text OCR', ARRAY['ocr', 'text', 'tesseract']),
  ('captchaiq-audio-v1', 'CaptchaIQ Audio', '1.0', 'audio', 'beta', 0.873, 1228, 'Whisper-based audio transcription', ARRAY['audio', 'whisper', 'transcription']),
  ('captchaiq-slider-v1', 'CaptchaIQ Slider', '1.0', 'slider', 'production', 0.961, 48, 'OpenCV-based slider gap detection', ARRAY['slider', 'opencv', 'vision']),
  ('captchaiq-detector-v1', 'CaptchaIQ Detector', '1.0', 'unknown', 'production', 0.984, 32, 'Challenge type auto-classifier', ARRAY['detection', 'routing']),
  ('captchaiq-behavioral-v1', 'CaptchaIQ Behavioral', '1.0', 'behavioral', 'experimental', 0.792, 95, 'Behavioral pattern research model', ARRAY['behavioral', 'research'])
ON CONFLICT (model_id) DO NOTHING;
