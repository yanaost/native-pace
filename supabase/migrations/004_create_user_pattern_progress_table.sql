-- Migration: Create user_pattern_progress table with RLS
-- Description: Tracks user learning progress for spaced repetition (SM-2 algorithm)

CREATE TABLE public.user_pattern_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pattern_id TEXT NOT NULL REFERENCES public.patterns(id) ON DELETE CASCADE,
  mastery_score INTEGER DEFAULT 0 CHECK (mastery_score BETWEEN 0 AND 100),
  times_practiced INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  ease_factor REAL DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pattern_id)
);

-- Enable RLS
ALTER TABLE public.user_pattern_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own progress
CREATE POLICY "Users can read own progress"
  ON public.user_pattern_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own progress
CREATE POLICY "Users can insert own progress"
  ON public.user_pattern_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own progress
CREATE POLICY "Users can update own progress"
  ON public.user_pattern_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own progress
CREATE POLICY "Users can delete own progress"
  ON public.user_pattern_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fetching due reviews (primary query for review queue)
CREATE INDEX idx_progress_user_next_review
  ON public.user_pattern_progress(user_id, next_review_at);

-- Index for looking up specific pattern progress
CREATE INDEX idx_progress_user_pattern
  ON public.user_pattern_progress(user_id, pattern_id);
