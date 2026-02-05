'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimerIcon from '@mui/icons-material/Timer';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PatternView from '@/components/exercises/PatternView';
import AudioComparison from '@/components/exercises/AudioComparison';
import ListeningDiscrimination from '@/components/exercises/ListeningDiscrimination';
import DictationChallenge from '@/components/exercises/DictationChallenge';
import SpeedTraining from '@/components/exercises/SpeedTraining';
import {
  createSessionState,
  getCurrentStep,
  isPatternViewStep,
  isExerciseStep,
  isSummaryStep,
  advanceStep,
  recordExerciseResult,
  getSessionProgress,
  createSessionResult,
  formatSessionTime,
  PracticeSessionState,
  ExerciseSessionResult,
} from '@/lib/utils/practice-session-helpers';
import type { Pattern } from '@/types/pattern';
import type { AudioComparisonResult } from '@/lib/utils/audio-comparison-helpers';
import type { DiscriminationResult } from '@/lib/utils/discrimination-helpers';
import type { DictationResult } from '@/lib/utils/dictation-helpers';
import type { SpeedTrainingResult } from '@/lib/utils/speed-training-helpers';

function PracticePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patternId = searchParams.get('pattern');

  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [sessionState, setSessionState] = useState<PracticeSessionState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load pattern data
  useEffect(() => {
    async function loadPattern() {
      if (!patternId) {
        setError('No pattern specified');
        setIsLoading(false);
        return;
      }

      const supabase = createClient();

      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch pattern
      const { data: patternData, error: patternError } = await supabase
        .from('patterns')
        .select('*')
        .eq('id', patternId)
        .single();

      if (patternError || !patternData) {
        setError('Pattern not found');
        setIsLoading(false);
        return;
      }

      // Transform database row to Pattern type
      const loadedPattern: Pattern = {
        id: patternData.id,
        category: patternData.category,
        level: patternData.level as 1 | 2 | 3 | 4 | 5 | 6,
        title: patternData.title,
        description: patternData.description,
        phoneticClear: patternData.phonetic_clear || '',
        phoneticReduced: patternData.phonetic_reduced || '',
        exampleSentence: patternData.example_sentence || '',
        exampleTranscription: patternData.example_transcription || '',
        audioClearUrl: patternData.audio_clear_url || '',
        audioConversationalUrl: patternData.audio_conversational_url || '',
        tips: patternData.tips || [],
        difficulty: (patternData.difficulty || 1) as 1 | 2 | 3 | 4 | 5,
        orderIndex: patternData.order_index,
      };

      setPattern(loadedPattern);
      setSessionState(createSessionState(patternId));
      setIsLoading(false);
    }

    loadPattern();
  }, [patternId, router]);

  const handleBack = useCallback(() => {
    if (pattern) {
      router.push(`/learn/${pattern.level}`);
    } else {
      router.push('/learn');
    }
  }, [pattern, router]);

  // Save progress to the database
  const saveProgress = useCallback(async (
    exerciseType: 'comparison' | 'discrimination' | 'dictation' | 'speed',
    isCorrect: boolean,
    responseTimeMs: number,
    userInput?: string
  ) => {
    if (!patternId) return;

    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patternId,
          exerciseType,
          isCorrect,
          responseTimeMs,
          userInput,
        }),
      });

      if (!response.ok) {
        console.error('Failed to save progress:', await response.text());
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [patternId]);

  const handlePatternViewNext = useCallback(() => {
    if (!sessionState) return;
    setSessionState(advanceStep(sessionState));
  }, [sessionState]);

  const handleComparisonComplete = useCallback(
    (result: AudioComparisonResult) => {
      if (!sessionState) return;
      const exerciseResult: ExerciseSessionResult = {
        exerciseType: 'comparison',
        isCorrect: result.completed,
        responseTimeMs: 0, // AudioComparison doesn't track time the same way
      };
      setSessionState(recordExerciseResult(sessionState, exerciseResult));
      saveProgress('comparison', result.completed, 0);
    },
    [sessionState, saveProgress]
  );

  const handleDiscriminationComplete = useCallback(
    (result: DiscriminationResult) => {
      if (!sessionState) return;
      const exerciseResult: ExerciseSessionResult = {
        exerciseType: 'discrimination',
        isCorrect: result.isCorrect,
        responseTimeMs: result.responseTimeMs,
      };
      setSessionState(recordExerciseResult(sessionState, exerciseResult));
      saveProgress('discrimination', result.isCorrect, result.responseTimeMs);
    },
    [sessionState, saveProgress]
  );

  const handleDictationComplete = useCallback(
    (result: DictationResult) => {
      if (!sessionState) return;
      const exerciseResult: ExerciseSessionResult = {
        exerciseType: 'dictation',
        isCorrect: result.isCorrect,
        responseTimeMs: result.responseTimeMs,
      };
      setSessionState(recordExerciseResult(sessionState, exerciseResult));
      saveProgress('dictation', result.isCorrect, result.responseTimeMs, result.userInput);
    },
    [sessionState, saveProgress]
  );

  const handleSpeedComplete = useCallback(
    (result: SpeedTrainingResult) => {
      if (!sessionState) return;
      const isCorrect = result.comfortableSpeed >= 1.0; // Consider "correct" if comfortable at normal speed
      const exerciseResult: ExerciseSessionResult = {
        exerciseType: 'speed',
        isCorrect,
        responseTimeMs: result.responseTimeMs,
      };
      setSessionState(recordExerciseResult(sessionState, exerciseResult));
      saveProgress('speed', isCorrect, result.responseTimeMs);
    },
    [sessionState, saveProgress]
  );

  const handleFinish = useCallback(() => {
    if (pattern) {
      router.push(`/learn/${pattern.level}`);
    } else {
      router.push('/learn');
    }
  }, [pattern, router]);

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error || !pattern || !sessionState) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <IconButton onClick={handleBack} aria-label="Back">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">Error</Typography>
        </Box>
        <Typography color="error">{error || 'Something went wrong'}</Typography>
        <Button variant="outline" onClick={handleBack} sx={{ mt: 2 }}>
          Back to Learning
        </Button>
      </Container>
    );
  }

  const progress = getSessionProgress(sessionState);
  const currentStep = getCurrentStep(sessionState);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header with Progress */}
      {!isSummaryStep(sessionState) && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <IconButton onClick={handleBack} aria-label="Back" size="small">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {progress.current} / {progress.total}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress.percentage}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      )}

      {/* Pattern View Step */}
      {isPatternViewStep(sessionState) && (
        <PatternView
          pattern={pattern}
          onNext={handlePatternViewNext}
          nextButtonText="Start Exercises"
          enableAudioShortcuts
        />
      )}

      {/* Exercise Steps */}
      {isExerciseStep(sessionState) && currentStep === 'comparison' && (
        <AudioComparison
          pattern={pattern}
          onComplete={handleComparisonComplete}
          enableAudioShortcuts
        />
      )}

      {isExerciseStep(sessionState) && currentStep === 'discrimination' && (
        <ListeningDiscrimination
          exerciseId={`${pattern.id}-discrimination`}
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

      {isExerciseStep(sessionState) && currentStep === 'dictation' && (
        <DictationChallenge
          exerciseId={`${pattern.id}-dictation`}
          patternId={pattern.id}
          audioUrl={pattern.audioConversationalUrl}
          correctAnswer={pattern.exampleTranscription}
          acceptableAnswers={[pattern.exampleSentence]}
          highlightPatternsText={[pattern.phoneticReduced]}
          maxReplays={3}
          prompt="Type what you hear"
          onComplete={handleDictationComplete}
        />
      )}

      {isExerciseStep(sessionState) && currentStep === 'speed' && (
        <SpeedTraining
          exerciseId={`${pattern.id}-speed`}
          patternId={pattern.id}
          audioUrl={pattern.audioConversationalUrl}
          prompt="Can you understand at this speed?"
          onComplete={handleSpeedComplete}
        />
      )}

      {/* Summary Step */}
      {isSummaryStep(sessionState) && (
        <PracticeSummary
          sessionState={sessionState}
          pattern={pattern}
          onFinish={handleFinish}
        />
      )}
    </Container>
  );
}

/** Summary component shown at end of practice session */
function PracticeSummary({
  sessionState,
  pattern,
  onFinish,
}: {
  sessionState: PracticeSessionState;
  pattern: Pattern;
  onFinish: () => void;
}) {
  const result = createSessionResult(sessionState);

  return (
    <Box sx={{ textAlign: 'center' }}>
      <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />

      <Typography variant="h4" gutterBottom>
        Practice Complete!
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        You practiced the pattern: <strong>{pattern.title}</strong>
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
            <Typography variant="h3" color="primary.main">
              {result.correctCount}/{result.totalCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Correct
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              <TimerIcon color="action" />
              <Typography variant="h5" color="text.primary">
                {formatSessionTime(result.totalTimeMs)}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Time
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Exercise Breakdown */}
      <Card sx={{ mb: 4, textAlign: 'left' }}>
        <Typography variant="h6" gutterBottom>
          Exercise Results
        </Typography>
        {result.exerciseResults.map((exerciseResult, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 1,
              borderBottom: index < result.exerciseResults.length - 1 ? 1 : 0,
              borderColor: 'divider',
            }}
          >
            <Typography sx={{ textTransform: 'capitalize' }}>
              {exerciseResult.exerciseType}
            </Typography>
            <Typography
              color={exerciseResult.isCorrect ? 'success.main' : 'error.main'}
            >
              {exerciseResult.isCorrect ? 'Correct' : 'Needs Practice'}
            </Typography>
          </Box>
        ))}
      </Card>

      <Button variant="primary" size="large" onClick={onFinish} fullWidth>
        Continue Learning
      </Button>
    </Box>
  );
}

/**
 * Practice page - orchestrates exercise flow for a pattern
 */
export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography>Loading...</Typography>
        </Container>
      }
    >
      <PracticePageContent />
    </Suspense>
  );
}
