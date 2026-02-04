'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
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
  checkAnswer,
  createResult,
  canSubmit,
  DiscriminationResult,
  DiscriminationState,
} from '@/lib/utils/discrimination-helpers';

// Re-export types for convenience
export type { DiscriminationResult, DiscriminationState };
export { createInitialState, checkAnswer, createResult, canSubmit };

/** Props for ListeningDiscrimination component */
export interface ListeningDiscriminationProps {
  /** Unique exercise identifier */
  exerciseId: string;
  /** ID of the pattern being tested */
  patternId: string;
  /** URL to the audio file */
  audioUrl: string;
  /** The correct answer */
  correctAnswer: string;
  /** Answer options to display (3-4 typically) */
  options: string[];
  /** Optional prompt to display (default: "What did you hear?") */
  prompt?: string;
  /** Callback when user completes the exercise */
  onComplete: (result: DiscriminationResult) => void;
}

type PlaybackState = 'idle' | 'loading' | 'playing';

/**
 * ListeningDiscrimination exercise component.
 * Plays an audio clip and asks the user to select what they heard.
 */
export default function ListeningDiscrimination({
  exerciseId,
  patternId,
  audioUrl,
  correctAnswer,
  options,
  prompt = 'What did you hear?',
  onComplete,
}: ListeningDiscriminationProps) {
  const [state, setState] = useState<DiscriminationState>(createInitialState);
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

    audio.currentTime = 0;

    if (audio.readyState >= 3) {
      audio.play();
      setPlaybackState('playing');
      setHasPlayedOnce(true);
    } else {
      setPlaybackState('loading');
      audio.addEventListener(
        'canplaythrough',
        () => {
          audio.play();
          setPlaybackState('playing');
          setHasPlayedOnce(true);
        },
        { once: true }
      );
    }
  }, []);

  const handleOptionChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (state.hasSubmitted) return;
    setState((prev) => ({ ...prev, selectedOption: event.target.value }));
  }, [state.hasSubmitted]);

  const handleSubmit = useCallback(() => {
    if (!canSubmit(state)) return;

    const isCorrect = checkAnswer(state.selectedOption!, correctAnswer);
    setState((prev) => ({ ...prev, hasSubmitted: true, isCorrect }));

    const result = createResult(exerciseId, patternId, state, correctAnswer);
    onComplete({ ...result, isCorrect });
  }, [state, correctAnswer, exerciseId, patternId, onComplete]);

  const isPlaying = playbackState === 'playing';
  const isLoading = playbackState === 'loading';

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
          disabled={isLoading}
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
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
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          {hasPlayedOnce ? 'Tap to replay' : 'Tap to play'}
        </Typography>
      </Card>

      {/* Options */}
      <Card sx={{ mb: 3 }}>
        <RadioGroup value={state.selectedOption || ''} onChange={handleOptionChange}>
          {options.map((option, index) => {
            const isSelected = state.selectedOption === option;
            const isCorrectOption = option.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
            const showFeedback = state.hasSubmitted;

            let bgcolor = 'transparent';
            let icon = null;

            if (showFeedback && isSelected) {
              bgcolor = state.isCorrect ? 'success.light' : 'error.light';
              icon = state.isCorrect ? (
                <CheckCircleIcon color="success" sx={{ ml: 1 }} />
              ) : (
                <CancelIcon color="error" sx={{ ml: 1 }} />
              );
            } else if (showFeedback && isCorrectOption && !state.isCorrect) {
              bgcolor = 'success.light';
              icon = <CheckCircleIcon color="success" sx={{ ml: 1 }} />;
            }

            return (
              <Box
                key={index}
                sx={{
                  bgcolor,
                  borderRadius: 1,
                  mb: 1,
                  transition: 'background-color 0.2s',
                }}
              >
                <FormControlLabel
                  value={option}
                  control={<Radio disabled={state.hasSubmitted} />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography>{option}</Typography>
                      {icon}
                    </Box>
                  }
                  sx={{ width: '100%', m: 0, p: 1 }}
                />
              </Box>
            );
          })}
        </RadioGroup>
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
          Check Answer
        </Button>
      )}

      {/* Feedback */}
      {state.hasSubmitted && (
        <Box
          sx={{
            textAlign: 'center',
            p: 2,
            bgcolor: state.isCorrect ? 'success.light' : 'error.light',
            borderRadius: 1,
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            {state.isCorrect ? 'Correct!' : 'Not quite'}
          </Typography>
          {!state.isCorrect && (
            <Typography variant="body2">
              The correct answer was: <strong>{correctAnswer}</strong>
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
