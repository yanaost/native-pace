-- Migration: Create practice_sessions table with RLS
-- Description: Tracks practice sessions for streak tracking and session analytics

CREATE TABLE public.practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  patterns_practiced INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own sessions (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Users can manage own sessions"
  ON public.practice_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for querying user's sessions by date
CREATE INDEX idx_sessions_user_started
  ON public.practice_sessions(user_id, started_at);
