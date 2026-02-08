/**
 * Analytics Tracking Functions
 *
 * Type-safe tracking functions for key user flows.
 * These wrap the generic trackEvent function with proper event names and types.
 */

import { trackEvent } from './posthog';
import { ANALYTICS_EVENTS } from './events';

/** Auth method type */
export type AuthMethod = 'email' | 'google';

/** Audio speed type */
export type AudioSpeed = 'slow' | 'fast';

/** Plan type */
export type PlanType = 'monthly' | 'yearly' | 'lifetime';

/** Exercise type */
export type ExerciseType = 'comparison' | 'discrimination' | 'dictation' | 'speed';

// ============================================================================
// Onboarding Tracking
// ============================================================================

/**
 * Track when user starts signup flow.
 */
export function trackSignupStarted(method: AuthMethod): void {
  trackEvent(ANALYTICS_EVENTS.SIGNUP_STARTED, { method });
}

/**
 * Track when user completes signup.
 */
export function trackSignupCompleted(userId: string, method: AuthMethod): void {
  trackEvent(ANALYTICS_EVENTS.SIGNUP_COMPLETED, { userId, method });
}

/**
 * Track when user logs in.
 */
export function trackLoginCompleted(userId: string, method: AuthMethod): void {
  trackEvent(ANALYTICS_EVENTS.LOGIN_COMPLETED, { userId, method });
}

/**
 * Track when user logs out.
 */
export function trackLogout(): void {
  trackEvent(ANALYTICS_EVENTS.LOGOUT, {});
}

/**
 * Track onboarding step completion.
 */
export function trackOnboardingStep(step: number, stepName: string): void {
  trackEvent(ANALYTICS_EVENTS.ONBOARDING_STEP, { step, stepName });
}

// ============================================================================
// Learning Tracking
// ============================================================================

/**
 * Track when user views a pattern.
 */
export function trackPatternViewed(patternId: string, level: number): void {
  trackEvent(ANALYTICS_EVENTS.PATTERN_VIEWED, { patternId, level });
}

/**
 * Track when user plays pattern audio.
 */
export function trackPatternAudioPlayed(patternId: string, speed: AudioSpeed): void {
  trackEvent(ANALYTICS_EVENTS.PATTERN_AUDIO_PLAYED, { patternId, speed });
}

/**
 * Track when user completes a pattern.
 */
export function trackPatternCompleted(patternId: string, level: number): void {
  trackEvent(ANALYTICS_EVENTS.PATTERN_COMPLETED, { patternId, level });
}

/**
 * Track when user completes a level.
 */
export function trackLevelCompleted(level: number, patternsCompleted: number): void {
  trackEvent(ANALYTICS_EVENTS.LEVEL_COMPLETED, { level, patternsCompleted });
}

// ============================================================================
// Exercise Tracking
// ============================================================================

/**
 * Track when user starts an exercise.
 */
export function trackExerciseStarted(exerciseType: ExerciseType, patternId: string): void {
  trackEvent(ANALYTICS_EVENTS.EXERCISE_STARTED, { exerciseType, patternId });
}

/**
 * Track when user answers an exercise.
 */
export function trackExerciseAnswered(
  exerciseType: ExerciseType,
  patternId: string,
  isCorrect: boolean,
  responseTimeMs?: number
): void {
  trackEvent(ANALYTICS_EVENTS.EXERCISE_ANSWERED, {
    exerciseType,
    patternId,
    isCorrect,
    responseTimeMs,
  });
}

/**
 * Track when user completes an exercise session.
 */
export function trackExerciseCompleted(
  exerciseType: ExerciseType,
  patternsCount: number,
  accuracy: number
): void {
  trackEvent(ANALYTICS_EVENTS.EXERCISE_COMPLETED, {
    exerciseType,
    patternsCount,
    accuracy,
  });
}

// ============================================================================
// Engagement Tracking
// ============================================================================

/**
 * Track when user achieves a streak milestone.
 */
export function trackStreakAchieved(streakDays: number): void {
  trackEvent(ANALYTICS_EVENTS.STREAK_ACHIEVED, { streakDays });
}

/**
 * Track when user starts a review session.
 */
export function trackReviewSessionStarted(dueCount: number): void {
  trackEvent(ANALYTICS_EVENTS.REVIEW_SESSION_STARTED, { dueCount });
}

/**
 * Track when user completes a review session.
 */
export function trackReviewSessionCompleted(reviewedCount: number, accuracy: number): void {
  trackEvent(ANALYTICS_EVENTS.REVIEW_SESSION_COMPLETED, { reviewedCount, accuracy });
}

// ============================================================================
// Monetization Tracking
// ============================================================================

/**
 * Track when user views a paywall.
 */
export function trackPaywallViewed(source: string, levelId?: number): void {
  trackEvent(ANALYTICS_EVENTS.PAYWALL_VIEWED, { source, levelId });
}

/**
 * Track when user starts checkout.
 */
export function trackCheckoutStarted(planType: PlanType): void {
  trackEvent(ANALYTICS_EVENTS.CHECKOUT_STARTED, { planType });
}

/**
 * Track when subscription starts (from webhook).
 */
export function trackSubscriptionStarted(planType: PlanType, userId: string): void {
  trackEvent(ANALYTICS_EVENTS.SUBSCRIPTION_STARTED, { planType, userId });
}

/**
 * Track when subscription is cancelled.
 */
export function trackSubscriptionCancelled(userId: string, reason?: string): void {
  trackEvent(ANALYTICS_EVENTS.SUBSCRIPTION_CANCELLED, { userId, reason });
}
