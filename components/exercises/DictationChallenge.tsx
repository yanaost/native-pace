'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  createInitialState,
  createResult,
  canSubmit,
  canReplay,
  highlightPatterns,
  DictationResult,
  DictationState,
  TextSegment,
} from '@/lib/utils/dictation-helpers';

// Re-export types for convenience
export type { DictationResult, DictationState, TextSegment };
export { createInitialState, createResult, canSubmit, canReplay, highlightPatterns };

/** Props for DictationChallenge component */
export interface DictationChallengeProps {
  /** Unique exercise identifier */
  exerciseId: string;
  /** ID of the pattern being tested */
  patternId: string;
  /** URL to the audio file */
  audioUrl: string;
  /** The correct answer */
  correctAnswer: string;
  /** Alternative acceptable answers */
  acceptableAnswers?: string[];
  /** Patterns to highlight in the correct answer */
  highlightPatternsText?: string[];
  /** Maximum number of replays allowed (default: 3) */
  maxReplays?: number;
  /** Optional prompt to display (default: "Type what you hear") */
  prompt?: string;
  /** Callback when user completes the exercise */
  onComplete: (result: DictationResult) => void;
}

type PlaybackState = 'idle' | 'loading' | 'playing';

/**
 * DictationChallenge exercise component.
 * Plays audio and asks the user to type what they hear.
 * Uses fuzzy matching to accept reasonable variations.
 */
export default function DictationChallenge({
  exerciseId,
  patternId,
  audioUrl,
  correctAnswer,
  acceptableAnswers = [],
  highlightPatternsText = [],
  maxReplays = 3,
  prompt = 'Type what you hear',
  onComplete,
}: DictationChallengeProps) {
  const [state, setState] = useState<DictationState>(createInitialState);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Preload audio on mount
  useEffect(() => {
    audioRef.current = new Audio(audioUrl);
    audioRef.current.preload = 'auto';

    const handleEnded = () => setPlaybackState('idle');
    audioRef.current.addEventListener('ended', handleEnded);

    return () => {
      audioRef.current?.pause();
      audioRef.current?.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const playAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Check replay limit (first play doesn't count)
    if (hasPlayedOnce && !canReplay(state.replaysUsed, maxReplays)) {
      return;
    }

    audio.currentTime = 0;

    if (audio.readyState >= 3) {
      audio.play();
      setPlaybackState('playing');
      if (hasPlayedOnce) {
        setState((prev) => ({ ...prev, replaysUsed: prev.replaysUsed + 1 }));
      }
      setHasPlayedOnce(true);
    } else {
      setPlaybackState('loading');
      audio.addEventListener(
        'canplaythrough',
        () => {
          audio.play();
          setPlaybackState('playing');
          if (hasPlayedOnce) {
            setState((prev) => ({ ...prev, replaysUsed: prev.replaysUsed + 1 }));
          }
          setHasPlayedOnce(true);
        },
        { once: true }
      );
    }
  }, [hasPlayedOnce, state.replaysUsed, maxReplays]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (state.hasSubmitted) return;
      setState((prev) => ({ ...prev, userInput: event.target.value }));
    },
    [state.hasSubmitted]
  );

  const handleSubmit = useCallback(() => {
    if (!canSubmit(state)) return;

    const result = createResult(exerciseId, patternId, state, correctAnswer, acceptableAnswers);
    setState((prev) => ({ ...prev, hasSubmitted: true, isCorrect: result.isCorrect }));
    onComplete(result);
  }, [state, exerciseId, patternId, correctAnswer, acceptableAnswers, onComplete]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && canSubmit(state)) {
        event.preventDefault();
        handleSubmit();
      }
    },
    [state, handleSubmit]
  );

  const isPlaying = playbackState === 'playing';
  const isLoading = playbackState === 'loading';
  const replaysRemaining = maxReplays - state.replaysUsed;
  const canReplayMore = hasPlayedOnce && canReplay(state.replaysUsed, maxReplays);

  // Get highlighted segments for displaying correct answer
  const highlightedAnswer = highlightPatterns(correctAnswer, highlightPatternsText);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      {/* Prompt */}
      <Typography variant="h5" component="h1" gutterBottom textAlign="center">
        {prompt}
      </Typography>

      {/* Audio Player */}
      <Card sx={{ mb: 3, textAlign: 'center' }}>
        <IconButton
          onClick={playAudio}
          disabled={isLoading || (hasPlayedOnce && !canReplayMore && !state.hasSubmitted)}
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
            '&.Mui-disabled': { bgcolor: 'grey.300', color: 'grey.500' },
            animation: isPlaying ? 'pulse 1s infinite' : 'none',
            '@keyframes pulse': {
              '0%, 100%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
            },
          }}
        >
          {isLoading ? (
            <CircularProgress size={32} color="inherit" />
          ) : hasPlayedOnce ? (
            <ReplayIcon sx={{ fontSize: 40 }} />
          ) : (
            <PlayArrowIcon sx={{ fontSize: 40 }} />
          )}
        </IconButton>
        {!state.hasSubmitted && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            {hasPlayedOnce
              ? `Replays remaining: ${replaysRemaining}`
              : 'Tap to play'}
          </Typography>
        )}
      </Card>

      {/* Text Input */}
      <Card sx={{ mb: 3 }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={4}
          placeholder="Type what you hear..."
          value={state.userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={state.hasSubmitted}
          autoComplete="off"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: state.hasSubmitted
                ? state.isCorrect
                  ? 'success.light'
                  : 'error.light'
                : 'transparent',
            },
          }}
        />
      </Card>

      {/* Submit Button */}
      {!state.hasSubmitted && (
        <Button
          variant="primary"
          size="large"
          onClick={handleSubmit}
          disabled={!canSubmit(state)}
          fullWidth
        >
          Submit Answer
        </Button>
      )}

      {/* Feedback */}
      {state.hasSubmitted && (
        <Card
          sx={{
            textAlign: 'center',
            bgcolor: state.isCorrect ? 'success.light' : 'error.light',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            {state.isCorrect ? (
              <CheckCircleIcon color="success" sx={{ fontSize: 40, mr: 1 }} />
            ) : (
              <CancelIcon color="error" sx={{ fontSize: 40, mr: 1 }} />
            )}
            <Typography variant="h6">
              {state.isCorrect ? 'Correct!' : 'Not quite'}
            </Typography>
          </Box>

          <Typography variant="body1" sx={{ mb: 1 }}>
            {state.isCorrect ? 'Great job!' : 'The correct answer was:'}
          </Typography>

          {!state.isCorrect && (
            <Typography
              variant="body1"
              sx={{
                fontWeight: 'bold',
                p: 1,
                bgcolor: 'background.paper',
                borderRadius: 1,
              }}
            >
              {highlightedAnswer.map((segment, index) => (
                <Box
                  key={index}
                  component="span"
                  sx={{
                    bgcolor: segment.isHighlighted ? 'warning.light' : 'transparent',
                    px: segment.isHighlighted ? 0.5 : 0,
                    borderRadius: segment.isHighlighted ? 0.5 : 0,
                  }}
                >
                  {segment.text}
                </Box>
              ))}
            </Typography>
          )}
        </Card>
      )}
    </Box>
  );
}
