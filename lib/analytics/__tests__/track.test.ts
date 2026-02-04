import { ANALYTICS_EVENTS } from '../events';
import {
  trackSignupStarted,
  trackSignupCompleted,
  trackOnboardingStep,
  trackPatternViewed,
  trackPatternAudioPlayed,
  trackPatternCompleted,
  trackLevelCompleted,
  trackExerciseStarted,
  trackExerciseAnswered,
  trackExerciseCompleted,
  trackStreakAchieved,
  trackReviewSessionStarted,
  trackReviewSessionCompleted,
  trackPaywallViewed,
  trackCheckoutStarted,
  trackSubscriptionStarted,
  trackSubscriptionCancelled,
} from '../track';

// Mock the posthog module
jest.mock('../posthog', () => ({
  trackEvent: jest.fn(),
}));

import { trackEvent } from '../posthog';

const mockTrackEvent = trackEvent as jest.MockedFunction<typeof trackEvent>;

describe('Onboarding Tracking', () => {
  beforeEach(() => {
    mockTrackEvent.mockClear();
  });

  describe('trackSignupStarted', () => {
    it('should track with email method', () => {
      trackSignupStarted('email');
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.SIGNUP_STARTED, {
        method: 'email',
      });
    });

    it('should track with google method', () => {
      trackSignupStarted('google');
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.SIGNUP_STARTED, {
        method: 'google',
      });
    });
  });

  describe('trackSignupCompleted', () => {
    it('should track with userId and method', () => {
      trackSignupCompleted('user-123', 'email');
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.SIGNUP_COMPLETED, {
        userId: 'user-123',
        method: 'email',
      });
    });
  });

  describe('trackOnboardingStep', () => {
    it('should track step number and name', () => {
      trackOnboardingStep(1, 'select_language');
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.ONBOARDING_STEP, {
        step: 1,
        stepName: 'select_language',
      });
    });
  });
});

describe('Learning Tracking', () => {
  beforeEach(() => {
    mockTrackEvent.mockClear();
  });

  describe('trackPatternViewed', () => {
    it('should track patternId and level', () => {
      trackPatternViewed('reduction-wanna', 1);
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.PATTERN_VIEWED, {
        patternId: 'reduction-wanna',
        level: 1,
      });
    });
  });

  describe('trackPatternAudioPlayed', () => {
    it('should track slow speed', () => {
      trackPatternAudioPlayed('reduction-wanna', 'slow');
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.PATTERN_AUDIO_PLAYED, {
        patternId: 'reduction-wanna',
        speed: 'slow',
      });
    });

    it('should track fast speed', () => {
      trackPatternAudioPlayed('reduction-wanna', 'fast');
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.PATTERN_AUDIO_PLAYED, {
        patternId: 'reduction-wanna',
        speed: 'fast',
      });
    });
  });

  describe('trackPatternCompleted', () => {
    it('should track patternId and level', () => {
      trackPatternCompleted('reduction-gonna', 1);
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.PATTERN_COMPLETED, {
        patternId: 'reduction-gonna',
        level: 1,
      });
    });
  });

  describe('trackLevelCompleted', () => {
    it('should track level and patterns count', () => {
      trackLevelCompleted(2, 30);
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.LEVEL_COMPLETED, {
        level: 2,
        patternsCompleted: 30,
      });
    });
  });
});

describe('Exercise Tracking', () => {
  beforeEach(() => {
    mockTrackEvent.mockClear();
  });

  describe('trackExerciseStarted', () => {
    it('should track exercise type and pattern', () => {
      trackExerciseStarted('dictation', 'reduction-wanna');
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.EXERCISE_STARTED, {
        exerciseType: 'dictation',
        patternId: 'reduction-wanna',
      });
    });
  });

  describe('trackExerciseAnswered', () => {
    it('should track correct answer', () => {
      trackExerciseAnswered('discrimination', 'reduction-gonna', true);
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.EXERCISE_ANSWERED, {
        exerciseType: 'discrimination',
        patternId: 'reduction-gonna',
        isCorrect: true,
        responseTimeMs: undefined,
      });
    });

    it('should track incorrect answer with response time', () => {
      trackExerciseAnswered('dictation', 'weak-form-to', false, 5000);
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.EXERCISE_ANSWERED, {
        exerciseType: 'dictation',
        patternId: 'weak-form-to',
        isCorrect: false,
        responseTimeMs: 5000,
      });
    });
  });

  describe('trackExerciseCompleted', () => {
    it('should track exercise session completion', () => {
      trackExerciseCompleted('speed', 10, 0.85);
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.EXERCISE_COMPLETED, {
        exerciseType: 'speed',
        patternsCount: 10,
        accuracy: 0.85,
      });
    });
  });
});

describe('Engagement Tracking', () => {
  beforeEach(() => {
    mockTrackEvent.mockClear();
  });

  describe('trackStreakAchieved', () => {
    it('should track streak days', () => {
      trackStreakAchieved(7);
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.STREAK_ACHIEVED, {
        streakDays: 7,
      });
    });
  });

  describe('trackReviewSessionStarted', () => {
    it('should track due count', () => {
      trackReviewSessionStarted(15);
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.REVIEW_SESSION_STARTED, {
        dueCount: 15,
      });
    });
  });

  describe('trackReviewSessionCompleted', () => {
    it('should track reviewed count and accuracy', () => {
      trackReviewSessionCompleted(12, 0.92);
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.REVIEW_SESSION_COMPLETED, {
        reviewedCount: 12,
        accuracy: 0.92,
      });
    });
  });
});

describe('Monetization Tracking', () => {
  beforeEach(() => {
    mockTrackEvent.mockClear();
  });

  describe('trackPaywallViewed', () => {
    it('should track source', () => {
      trackPaywallViewed('level_gate');
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.PAYWALL_VIEWED, {
        source: 'level_gate',
        levelId: undefined,
      });
    });

    it('should track source with levelId', () => {
      trackPaywallViewed('level_gate', 3);
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.PAYWALL_VIEWED, {
        source: 'level_gate',
        levelId: 3,
      });
    });
  });

  describe('trackCheckoutStarted', () => {
    it('should track monthly plan', () => {
      trackCheckoutStarted('monthly');
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.CHECKOUT_STARTED, {
        planType: 'monthly',
      });
    });

    it('should track yearly plan', () => {
      trackCheckoutStarted('yearly');
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.CHECKOUT_STARTED, {
        planType: 'yearly',
      });
    });

    it('should track lifetime plan', () => {
      trackCheckoutStarted('lifetime');
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.CHECKOUT_STARTED, {
        planType: 'lifetime',
      });
    });
  });

  describe('trackSubscriptionStarted', () => {
    it('should track plan type and userId', () => {
      trackSubscriptionStarted('yearly', 'user-456');
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.SUBSCRIPTION_STARTED, {
        planType: 'yearly',
        userId: 'user-456',
      });
    });
  });

  describe('trackSubscriptionCancelled', () => {
    it('should track userId', () => {
      trackSubscriptionCancelled('user-789');
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.SUBSCRIPTION_CANCELLED, {
        userId: 'user-789',
        reason: undefined,
      });
    });

    it('should track userId with reason', () => {
      trackSubscriptionCancelled('user-789', 'too_expensive');
      expect(mockTrackEvent).toHaveBeenCalledWith(ANALYTICS_EVENTS.SUBSCRIPTION_CANCELLED, {
        userId: 'user-789',
        reason: 'too_expensive',
      });
    });
  });
});
