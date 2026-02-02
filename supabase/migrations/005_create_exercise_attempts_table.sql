-- Migration: Create exercise_attempts table with RLS
-- Description: Tracks individual exercise attempts for analytics and progress tracking

CREATE TABLE public.exercise_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pattern_id TEXT REFERENCES public.patterns(id) ON DELETE SET NULL,
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('comparison', 'discrimination', 'dictation', 'speed')),
  is_correct BOOLEAN NOT NULL,
  response_time_ms INTEGER,
  user_input TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.exercise_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own attempts (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Users can manage own attempts"
  ON public.exercise_attempts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for querying user's attempts by date
CREATE INDEX idx_attempts_user_created
  ON public.exercise_attempts(user_id, created_at);
