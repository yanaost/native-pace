-- Migration: Create patterns table
-- Description: Stores connected speech pattern definitions (seeded content)

CREATE TABLE public.patterns (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('weak-forms', 'reductions', 'linking', 'elision', 'assimilation', 'flapping')),
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 6),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  phonetic_clear TEXT,
  phonetic_reduced TEXT,
  example_sentence TEXT,
  example_transcription TEXT,
  audio_slow_url TEXT,
  audio_fast_url TEXT,
  tips TEXT[] DEFAULT '{}',
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  order_index INTEGER NOT NULL
);

-- Enable RLS (required for Supabase)
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read patterns (public content)
CREATE POLICY "Patterns are publicly readable"
  ON public.patterns
  FOR SELECT
  USING (true);

-- Indexes for common queries
CREATE INDEX idx_patterns_level ON public.patterns(level);
CREATE INDEX idx_patterns_category ON public.patterns(category);
CREATE INDEX idx_patterns_level_order ON public.patterns(level, order_index);
