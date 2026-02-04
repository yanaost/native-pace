'use client';

import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AudioPlayer from '@/components/ui/AudioPlayer';
import { formatPhonetic } from '@/lib/utils/pattern-helpers';
import {
  createInitialResult,
  hasListenedToBoth,
  AudioComparisonResult,
} from '@/lib/utils/audio-comparison-helpers';
import type { Pattern } from '@/types/pattern';

// Re-export types and helpers for convenience
export type { AudioComparisonResult };
export { createInitialResult, hasListenedToBoth };

/** Props for AudioComparison component */
export interface AudioComparisonProps {
  /** The pattern to compare */
  pattern: Pattern;
  /** Callback when user completes the exercise */
  onComplete: (result: AudioComparisonResult) => void;
  /** Whether to enable keyboard shortcuts for audio (default: true) */
  enableAudioShortcuts?: boolean;
}

/**
 * AudioComparison exercise component.
 * Displays a pattern with slow and fast audio versions.
 * User can listen to both and mark as understood.
 */
export default function AudioComparison({
  pattern,
  onComplete,
  enableAudioShortcuts = true,
}: AudioComparisonProps) {
  const [result, setResult] = useState<AudioComparisonResult>(() =>
    createInitialResult(pattern.id)
  );

  const handlePlaySlow = useCallback(() => {
    setResult((prev) => ({ ...prev, listenedSlow: true }));
  }, []);

  const handlePlayFast = useCallback(() => {
    setResult((prev) => ({ ...prev, listenedFast: true }));
  }, []);

  const handleReplay = useCallback(() => {
    setResult((prev) => ({ ...prev, replayCount: prev.replayCount + 1 }));
  }, []);

  const handleUnderstood = useCallback(() => {
    const completedResult: AudioComparisonResult = {
      ...result,
      completed: true,
    };
    onComplete(completedResult);
  }, [result, onComplete]);

  const canComplete = hasListenedToBoth(result);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      {/* Title and Description */}
      <Typography variant="h5" component="h1" gutterBottom>
        {pattern.title}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {pattern.description}
      </Typography>

      {/* Phonetic Comparison */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Dictionary
            </Typography>
            <Typography variant="h6" sx={{ fontFamily: 'serif' }}>
              {formatPhonetic(pattern.phoneticClear)}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Natural
            </Typography>
            <Typography variant="h6" sx={{ fontFamily: 'serif' }}>
              {formatPhonetic(pattern.phoneticReduced)}
            </Typography>
          </Box>
        </Box>

        {/* Example Sentence */}
        <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            &ldquo;{pattern.exampleSentence}&rdquo;
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sounds like: &ldquo;{pattern.exampleTranscription}&rdquo;
          </Typography>
        </Box>

        {/* Audio Player */}
        <AudioPlayer
          slowUrl={pattern.audioSlowUrl}
          fastUrl={pattern.audioFastUrl}
          audioId={`comparison-${pattern.id}`}
          onPlaySlow={handlePlaySlow}
          onPlayFast={handlePlayFast}
          enableGlobalShortcuts={enableAudioShortcuts}
        />

        {enableAudioShortcuts && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 1 }}
          >
            Keyboard: S = Slow, F = Fast, Space = Replay
          </Typography>
        )}
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="secondary"
          size="large"
          onClick={handleReplay}
          sx={{ flex: 1 }}
        >
          Replay
        </Button>
        <Button
          variant="primary"
          size="large"
          onClick={handleUnderstood}
          disabled={!canComplete}
          sx={{ flex: 1 }}
        >
          Understood
        </Button>
      </Box>

      {!canComplete && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mt: 1 }}
        >
          Listen to both slow and fast versions to continue
        </Typography>
      )}
    </Box>
  );
}
