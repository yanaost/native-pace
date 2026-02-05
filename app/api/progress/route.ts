import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createLogger } from '@/lib/utils/logger';
import { calculateSM2, exerciseResultToQuality } from '@/lib/utils/spaced-repetition';
import {
  validateAttemptRequest,
  parseAttemptRequest,
  calculateNewMastery,
  createAttemptRecord,
  createProgressRecord,
} from '@/lib/utils/progress-helpers';

const logger = createLogger('api/progress');

/** Response type for the progress API */
export interface ProgressResponse {
  success: boolean;
  data?: {
    masteryScore: number;
    nextReviewAt: string;
    isLearned: boolean;
  };
  error?: string;
}

/**
 * POST /api/progress
 *
 * Record an exercise attempt and update user progress.
 *
 * Request Body:
 * - patternId: string - The pattern ID
 * - exerciseType: string - Type of exercise (comparison, discrimination, dictation, speed)
 * - isCorrect: boolean - Whether the answer was correct
 * - responseTimeMs: number - Response time in milliseconds
 * - userInput?: string - User's input (for dictation exercises)
 * - sessionId?: string - Practice session ID (optional)
 */
export async function POST(request: NextRequest): Promise<NextResponse<ProgressResponse>> {
  const startTime = Date.now();

  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      logger.warn('Invalid JSON in request body');
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate request
    const validation = validateAttemptRequest(body);
    if (!validation.valid) {
      logger.warn('Invalid request body', { errors: validation.errors });
      return NextResponse.json(
        { success: false, error: validation.errors.join('; ') },
        { status: 400 }
      );
    }

    const attemptData = parseAttemptRequest(body as Record<string, unknown>);

    logger.info('Recording exercise attempt', {
      patternId: attemptData.patternId,
      exerciseType: attemptData.exerciseType,
      isCorrect: attemptData.isCorrect,
    });

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('Unauthorized request');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify pattern exists
    const { data: pattern, error: patternError } = await supabase
      .from('patterns')
      .select('id')
      .eq('id', attemptData.patternId)
      .single();

    if (patternError || !pattern) {
      logger.warn('Pattern not found', { patternId: attemptData.patternId });
      return NextResponse.json(
        { success: false, error: 'Pattern not found' },
        { status: 404 }
      );
    }

    // Get existing progress (if any)
    const { data: existingProgress } = await supabase
      .from('user_pattern_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('pattern_id', attemptData.patternId)
      .single();

    // Calculate SM-2 values
    const quality = exerciseResultToQuality(
      attemptData.isCorrect,
      attemptData.responseTimeMs
    );

    const previousEF = existingProgress?.ease_factor ?? 2.5;
    const previousInterval = existingProgress?.interval_days ?? 1;

    const sm2Result = calculateSM2(quality, previousEF, previousInterval);

    // Calculate new mastery
    const currentMastery = existingProgress?.mastery_score ?? 0;
    const newMastery = calculateNewMastery(
      currentMastery,
      attemptData.isCorrect,
      attemptData.exerciseType
    );

    // Calculate new counts
    const timesPracticed = (existingProgress?.times_practiced ?? 0) + 1;
    const timesCorrect = (existingProgress?.times_correct ?? 0) + (attemptData.isCorrect ? 1 : 0);

    // Insert exercise attempt
    const attemptRecord = createAttemptRecord(user.id, attemptData);
    const { error: attemptError } = await supabase
      .from('exercise_attempts')
      .insert(attemptRecord);

    if (attemptError) {
      logger.error('Failed to insert exercise attempt', attemptError);
      return NextResponse.json(
        { success: false, error: 'Failed to record attempt' },
        { status: 500 }
      );
    }

    // Upsert progress record
    const progressRecord = createProgressRecord(
      user.id,
      attemptData.patternId,
      newMastery,
      timesPracticed,
      timesCorrect,
      sm2Result.easeFactor,
      sm2Result.intervalDays,
      sm2Result.nextReviewDate
    );

    const { error: progressError } = await supabase
      .from('user_pattern_progress')
      .upsert(progressRecord, {
        onConflict: 'user_id,pattern_id',
      });

    if (progressError) {
      logger.error('Failed to update progress', progressError);
      return NextResponse.json(
        { success: false, error: 'Failed to update progress' },
        { status: 500 }
      );
    }

    // Update practice session if provided
    if (attemptData.sessionId) {
      // Fetch current session data
      const { data: currentSession } = await supabase
        .from('practice_sessions')
        .select('exercises_completed, correct_answers')
        .eq('id', attemptData.sessionId)
        .eq('user_id', user.id)
        .single();

      if (currentSession) {
        const updateData: Record<string, number> = {
          exercises_completed: (currentSession.exercises_completed || 0) + 1,
        };

        if (attemptData.isCorrect) {
          updateData.correct_answers = (currentSession.correct_answers || 0) + 1;
        }

        const { error: sessionError } = await supabase
          .from('practice_sessions')
          .update(updateData)
          .eq('id', attemptData.sessionId)
          .eq('user_id', user.id);

        if (sessionError) {
          // Log but don't fail - session update is not critical
          logger.warn('Failed to update practice session', { error: sessionError });
        }
      }
    }

    const duration = Date.now() - startTime;
    logger.info('Exercise attempt recorded successfully', {
      patternId: attemptData.patternId,
      newMastery,
      nextReviewAt: sm2Result.nextReviewDate.toISOString(),
      duration,
    });

    return NextResponse.json({
      success: true,
      data: {
        masteryScore: newMastery,
        nextReviewAt: sm2Result.nextReviewDate.toISOString(),
        isLearned: newMastery >= 50,
      },
    });
  } catch (error) {
    logger.error('Unexpected error recording progress', error as Error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
