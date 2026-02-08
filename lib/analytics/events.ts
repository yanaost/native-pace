/**
 * Analytics Events Constants
 *
 * All event names used for analytics tracking.
 * Use these constants instead of raw strings for type safety and consistency.
 */

/** All analytics event names */
export const ANALYTICS_EVENTS = {
  // Onboarding
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  LOGIN_COMPLETED: 'login_completed',
  LOGOUT: 'logout',
  ONBOARDING_STEP: 'onboarding_step',

  // Learning
  PATTERN_VIEWED: 'pattern_viewed',
  PATTERN_AUDIO_PLAYED: 'pattern_audio_played',
  PATTERN_COMPLETED: 'pattern_completed',
  LEVEL_COMPLETED: 'level_completed',

  // Exercises
  EXERCISE_STARTED: 'exercise_started',
  EXERCISE_ANSWERED: 'exercise_answered',
  EXERCISE_COMPLETED: 'exercise_completed',

  // Engagement
  STREAK_ACHIEVED: 'streak_achieved',
  REVIEW_SESSION_STARTED: 'review_session_started',
  REVIEW_SESSION_COMPLETED: 'review_session_completed',

  // Monetization
  PAYWALL_VIEWED: 'paywall_viewed',
  CHECKOUT_STARTED: 'checkout_started',
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
} as const;

/** Type for analytics event names */
export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/** Event categories for grouping */
export const EVENT_CATEGORIES = {
  ONBOARDING: ['signup_started', 'signup_completed', 'onboarding_step'],
  LEARNING: ['pattern_viewed', 'pattern_audio_played', 'pattern_completed', 'level_completed'],
  EXERCISES: ['exercise_started', 'exercise_answered', 'exercise_completed'],
  ENGAGEMENT: ['streak_achieved', 'review_session_started', 'review_session_completed'],
  MONETIZATION: ['paywall_viewed', 'checkout_started', 'subscription_started', 'subscription_cancelled'],
} as const;

/** Type for event category names */
export type EventCategory = keyof typeof EVENT_CATEGORIES;
