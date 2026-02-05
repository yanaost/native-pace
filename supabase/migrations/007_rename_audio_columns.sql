-- Migration: Rename audio columns from slow/fast to clear/conversational
-- Description: Updates column names and audio file paths to use new naming convention

-- Step 1: Rename the columns
ALTER TABLE public.patterns
  RENAME COLUMN audio_slow_url TO audio_clear_url;

ALTER TABLE public.patterns
  RENAME COLUMN audio_fast_url TO audio_conversational_url;

-- Step 2: Update the audio file paths to use new naming convention
UPDATE public.patterns
SET
  audio_clear_url = REPLACE(audio_clear_url, '-slow.mp3', '-clear.mp3'),
  audio_conversational_url = REPLACE(audio_conversational_url, '-fast.mp3', '-conversational.mp3');
