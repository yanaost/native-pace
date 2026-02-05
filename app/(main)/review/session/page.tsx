'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TimerIcon from '@mui/icons-material/Timer';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ListeningDiscrimination from '@/components/exercises/ListeningDiscrimination';
import DictationChallenge from '@/components/exercises/DictationChallenge';
import { getDuePatterns } from '@/lib/utils/review-queue';
import {
  createReviewSessionState,
  getCurrentPattern,
  getCurrentExerciseType,
  isReviewSummary,
  recordReviewExerciseResult,
  getReviewProgress,
  createReviewSessionResult,
  formatReviewProgress,
  ReviewSessionState,
  ReviewSessionResult,
  PatternReviewResult,
} from '@/lib/utils/review-session-helpers';
import { formatSessionTime } from '@/lib/utils/practice-session-helpers';
import type { DiscriminationResult } from '@/lib/utils/discrimination-helpers';
import type { DictationResult } from '@/lib/utils/dictation-helpers';
import type { Pattern } from '@/types/pattern';

/**
 * Review session page - handles multi-pattern review flow
 */
export default function ReviewSessionPage() {
  const router = useRouter();
  const [sessionState, setSessionState] = useState<ReviewSessionState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);

  // Load due patterns
  useEffect(() => {
    async function loadPatterns() {
      const supabase = createClient();

      // Check authentication
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch due patterns
      const patterns = await getDuePatterns(supabase, user.id);

      if (patterns.length === 0) {
        // No patterns to review, redirect back to review page
        router.push('/review');
        return;
      }

      setSessionState(createReviewSessionState(patterns));
      setIsLoading(false);
    }

    loadPatterns();
  }, [router]);

  // Record progress to API after each exercise
  const recordProgress = useCallback(
    async (
      patternId: string,
      exerciseType: string,
      isCorrect: boolean,
      responseTimeMs: number
    ) => {
      try {
        const response = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patternId,
            exerciseType,
            isCorrect,
            responseTimeMs,
          }),
        });

        if (!response.ok) {
          console.error('Failed to record progress');
        }
      } catch (error) {
        console.error('Error recording progress:', error);
      }
    },
    []
  );

  const handleDiscriminationComplete = useCallback(
    async (result: DiscriminationResult) => {
      if (!sessionState) return;

      const currentPattern = getCurrentPattern(sessionState);
      if (currentPattern) {
        await recordProgress(
          currentPattern.pattern_id,
          'discrimination',
          result.isCorrect,
          result.responseTimeMs
        );
      }

      setSessionState(
        recordReviewExerciseResult(sessionState, {
          exerciseType: 'discrimination',
          isCorrect: result.isCorrect,
          responseTimeMs: result.responseTimeMs,
        })
      );
    },
    [sessionState, recordProgress]
  );

  const handleDictationComplete = useCallback(
    async (result: DictationResult) => {
      if (!sessionState) return;

      const currentPattern = getCurrentPattern(sessionState);
      if (currentPattern) {
        await recordProgress(
          currentPattern.pattern_id,
          'dictation',
          result.isCorrect,
          result.responseTimeMs
        );
      }

      setSessionState(
        recordReviewExerciseResult(sessionState, {
          exerciseType: 'dictation',
          isCorrect: result.isCorrect,
          responseTimeMs: result.responseTimeMs,
        })
      );
    },
    [sessionState, recordProgress]
  );

  const handleBack = useCallback(() => {
    router.push('/review');
  }, [router]);

  const handleFinish = useCallback(() => {
    router.push('/review');
  }, [router]);

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading review session...</Typography>
      </Container>
    );
  }

  if (error || !sessionState) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="error">{error || 'Something went wrong'}</Typography>
        <Button variant="outline" onClick={handleBack} sx={{ mt: 2 }}>
          Back to Review
        </Button>
      </Container>
    );
  }

  // Show summary when complete
  if (isReviewSummary(sessionState)) {
    const result = createReviewSessionResult(sessionState);
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <ReviewSummary result={result} onFinish={handleFinish} />
      </Container>
    );
  }

  const currentPattern = getCurrentPattern(sessionState);
  const currentExercise = getCurrentExerciseType(sessionState);
  const progress = getReviewProgress(sessionState);

  if (!currentPattern || !currentExercise) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>No pattern available</Typography>
      </Container>
    );
  }

  // Transform pattern data
  const pattern: Pattern = {
    id: currentPattern.patterns?.id ?? currentPattern.pattern_id,
    category: currentPattern.patterns?.category ?? 'weak-forms',
    level: (currentPattern.patterns?.level ?? 1) as 1 | 2 | 3 | 4 | 5 | 6,
    title: currentPattern.patterns?.title ?? 'Pattern',
    description: currentPattern.patterns?.description ?? '',
    phoneticClear: currentPattern.patterns?.phonetic_clear ?? '',
    phoneticReduced: currentPattern.patterns?.phonetic_reduced ?? '',
    exampleSentence: currentPattern.patterns?.example_sentence ?? '',
    exampleTranscription: currentPattern.patterns?.example_transcription ?? '',
    audioClearUrl: currentPattern.patterns?.audio_clear_url ?? '',
    audioConversationalUrl: currentPattern.patterns?.audio_conversational_url ?? '',
    tips: currentPattern.patterns?.tips ?? [],
    difficulty: (currentPattern.patterns?.difficulty ?? 1) as 1 | 2 | 3 | 4 | 5,
    orderIndex: currentPattern.patterns?.order_index ?? 1,
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header with Progress */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <IconButton onClick={handleBack} aria-label="Back" size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            {formatReviewProgress(sessionState)} • Exercise{' '}
            {progress.currentExercise}/{progress.totalExercises}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress.overallPercentage}
          sx={{ height: 6, borderRadius: 3 }}
        />
      </Box>

      {/* Pattern Title */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        {pattern.title}
      </Typography>

      {/* Exercise Components */}
      {currentExercise === 'discrimination' && (
        <ListeningDiscrimination
          exerciseId={`${pattern.id}-review-discrimination`}
          patternId={pattern.id}
          audioUrl={pattern.audioConversationalUrl}
          correctAnswer={pattern.exampleTranscription}
          options={[
            pattern.exampleSentence,
            pattern.exampleTranscription,
            `${pattern.exampleSentence.split(' ').slice(0, -1).join(' ')}...`,
            'Something else entirely',
          ]}
          prompt="What did the speaker say?"
          onComplete={handleDiscriminationComplete}
        />
      )}

      {currentExercise === 'dictation' && (
        <DictationChallenge
          exerciseId={`${pattern.id}-review-dictation`}
          patternId={pattern.id}
          audioUrl={pattern.audioConversationalUrl}
          correctAnswer={pattern.exampleTranscription}
          acceptableAnswers={[pattern.exampleSentence]}
          highlightPatternsText={[pattern.phoneticReduced]}
          maxReplays={2}
          prompt="Type what you hear"
          onComplete={handleDictationComplete}
        />
      )}
    </Container>
  );
}

/**
 * Review summary component shown at end of session
 */
function ReviewSummary({
  result,
  onFinish,
}: {
  result: ReviewSessionResult;
  onFinish: () => void;
}) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />

      <Typography variant="h4" gutterBottom>
        Review Complete!
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        You reviewed {result.patternsReviewed} pattern
        {result.patternsReviewed !== 1 ? 's' : ''}
      </Typography>

      {/* Stats */}
      <Card sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', py: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="primary.main">
              {result.accuracy}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Accuracy
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="success.main">
              {result.patternsPassed}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Passed
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="error.main">
              {result.patternsFailed}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Need Practice
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            pt: 2,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <TimerIcon color="action" />
          <Typography variant="body1" color="text.secondary">
            {formatSessionTime(result.totalTimeMs)}
          </Typography>
        </Box>
      </Card>

      {/* Pattern Results */}
      <Card sx={{ mb: 4, textAlign: 'left' }}>
        <Typography variant="h6" gutterBottom>
          Pattern Results
        </Typography>
        {result.patternResults.map((patternResult, index) => (
          <PatternResultRow
            key={patternResult.patternId}
            result={patternResult}
            isLast={index === result.patternResults.length - 1}
          />
        ))}
      </Card>

      <Button variant="primary" size="large" onClick={onFinish} fullWidth>
        Done
      </Button>
    </Box>
  );
}

/**
 * Single pattern result row
 */
function PatternResultRow({
  result,
  isLast,
}: {
  result: PatternReviewResult;
  isLast: boolean;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1.5,
        borderBottom: isLast ? 0 : 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="body1">{result.patternTitle}</Typography>
        {result.category && (
          <Chip
            label={result.category}
            size="small"
            variant="outlined"
            sx={{ mt: 0.5, textTransform: 'capitalize' }}
          />
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {result.isCorrect ? (
          <CheckCircleIcon color="success" />
        ) : (
          <CancelIcon color="error" />
        )}
      </Box>
    </Box>
  );
}
