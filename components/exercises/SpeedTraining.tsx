'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  DEFAULT_SPEED_LEVELS,
  createInitialState,
  getCurrentSpeed,
  recordComprehension,
  createResult,
  formatSpeed,
  getSpeedLabel,
  getProgress,
  isExerciseComplete,
  calculateComfortableSpeed,
  SpeedTrainingResult,
  SpeedTrainingState,
  SpeedLevelResult,
} from '@/lib/utils/speed-training-helpers';

// Re-export types for convenience
export type { SpeedTrainingResult, SpeedTrainingState, SpeedLevelResult };
export {
  DEFAULT_SPEED_LEVELS,
  createInitialState,
  getCurrentSpeed,
  recordComprehension,
  createResult,
  formatSpeed,
  getSpeedLabel,
  getProgress,
  isExerciseComplete,
  calculateComfortableSpeed,
};

/** Props for SpeedTraining component */
export interface SpeedTrainingProps {
  /** Unique exercise identifier */
  exerciseId: string;
  /** ID of the pattern being tested */
  patternId: string;
  /** URL to the audio file */
  audioUrl: string;
  /** Speed levels to train on (default: [0.75, 1.0, 1.25]) */
  speedLevels?: readonly number[];
  /** Optional prompt to display */
  prompt?: string;
  /** Callback when user completes the exercise */
  onComplete: (result: SpeedTrainingResult) => void;
}

type PlaybackState = 'idle' | 'loading' | 'playing';

/**
 * SpeedTraining exercise component.
 * Plays audio at different speeds and tracks user comprehension.
 */
export default function SpeedTraining({
  exerciseId,
  patternId,
  audioUrl,
  speedLevels = DEFAULT_SPEED_LEVELS,
  prompt = 'Can you understand at this speed?',
  onComplete,
}: SpeedTrainingProps) {
  const [state, setState] = useState<SpeedTrainingState>(() =>
    createInitialState(speedLevels)
  );
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [hasPlayedCurrent, setHasPlayedCurrent] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSpeed = getCurrentSpeed(state);
  const progress = getProgress(state);
  const isComplete = isExerciseComplete(state);

  // Initialize audio on mount
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

  // Update playback rate when speed changes
  useEffect(() => {
    if (audioRef.current && currentSpeed !== null) {
      audioRef.current.playbackRate = currentSpeed;
    }
  }, [currentSpeed]);

  // Reset hasPlayedCurrent when moving to next speed
  useEffect(() => {
    setHasPlayedCurrent(false);
  }, [state.currentSpeedIndex]);

  const playAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || currentSpeed === null) return;

    audio.currentTime = 0;
    audio.playbackRate = currentSpeed;

    if (audio.readyState >= 3) {
      audio.play();
      setPlaybackState('playing');
      setHasPlayedCurrent(true);
    } else {
      setPlaybackState('loading');
      audio.addEventListener(
        'canplaythrough',
        () => {
          audio.play();
          setPlaybackState('playing');
          setHasPlayedCurrent(true);
        },
        { once: true }
      );
    }
  }, [currentSpeed]);

  const handleResponse = useCallback(
    (understood: boolean) => {
      if (!hasPlayedCurrent || isComplete) return;

      const newState = recordComprehension(state, understood);
      setState(newState);

      if (isExerciseComplete(newState)) {
        const result = createResult(exerciseId, patternId, newState);
        onComplete(result);
      }
    },
    [hasPlayedCurrent, isComplete, state, exerciseId, patternId, onComplete]
  );

  const isPlaying = playbackState === 'playing';
  const isLoading = playbackState === 'loading';

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      {/* Progress */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Speed {progress.current} of {progress.total}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {progress.percentage}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress.percentage}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {!isComplete ? (
        <>
          {/* Current Speed Display */}
          <Card sx={{ mb: 3, textAlign: 'center' }}>
            <Chip
              label={getSpeedLabel(currentSpeed!)}
              color="primary"
              sx={{ mb: 2 }}
            />
            <Typography variant="h3" sx={{ mb: 1, fontWeight: 'bold' }}>
              {formatSpeed(currentSpeed!)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {prompt}
            </Typography>
          </Card>

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
              ) : hasPlayedCurrent ? (
                <ReplayIcon sx={{ fontSize: 40 }} />
              ) : (
                <PlayArrowIcon sx={{ fontSize: 40 }} />
              )}
            </IconButton>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              {hasPlayedCurrent ? 'Tap to replay' : 'Tap to play'}
            </Typography>
          </Card>

          {/* Response Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="secondary"
              size="large"
              onClick={() => handleResponse(false)}
              disabled={!hasPlayedCurrent}
              startIcon={<CloseIcon />}
              sx={{ flex: 1 }}
            >
              Too Fast
            </Button>
            <Button
              variant="primary"
              size="large"
              onClick={() => handleResponse(true)}
              disabled={!hasPlayedCurrent}
              startIcon={<CheckIcon />}
              sx={{ flex: 1 }}
            >
              Understood
            </Button>
          </Box>

          {!hasPlayedCurrent && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', textAlign: 'center', mt: 1 }}
            >
              Listen to the audio before responding
            </Typography>
          )}
        </>
      ) : (
        /* Results Summary */
        <Card sx={{ textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Training Complete!
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Your comfortable speed:
            </Typography>
            <Typography
              variant="h3"
              sx={{ fontWeight: 'bold', color: 'primary.main' }}
            >
              {formatSpeed(calculateComfortableSpeed(state.speedResults))}
            </Typography>
          </Box>

          {/* Speed Results */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            {state.speedResults.map((result, index) => (
              <Chip
                key={index}
                label={formatSpeed(result.speed)}
                color={result.understood ? 'success' : 'default'}
                variant={result.understood ? 'filled' : 'outlined'}
                icon={result.understood ? <CheckIcon /> : <CloseIcon />}
              />
            ))}
          </Box>
        </Card>
      )}
    </Box>
  );
}
