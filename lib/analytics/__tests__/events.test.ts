import { ANALYTICS_EVENTS, EVENT_CATEGORIES, type AnalyticsEvent } from '../events';

describe('ANALYTICS_EVENTS', () => {
  it('should export an object', () => {
    expect(typeof ANALYTICS_EVENTS).toBe('object');
    expect(ANALYTICS_EVENTS).not.toBeNull();
  });

  describe('Onboarding events', () => {
    it('should have SIGNUP_STARTED', () => {
      expect(ANALYTICS_EVENTS.SIGNUP_STARTED).toBe('signup_started');
    });

    it('should have SIGNUP_COMPLETED', () => {
      expect(ANALYTICS_EVENTS.SIGNUP_COMPLETED).toBe('signup_completed');
    });

    it('should have ONBOARDING_STEP', () => {
      expect(ANALYTICS_EVENTS.ONBOARDING_STEP).toBe('onboarding_step');
    });
  });

  describe('Learning events', () => {
    it('should have PATTERN_VIEWED', () => {
      expect(ANALYTICS_EVENTS.PATTERN_VIEWED).toBe('pattern_viewed');
    });

    it('should have PATTERN_AUDIO_PLAYED', () => {
      expect(ANALYTICS_EVENTS.PATTERN_AUDIO_PLAYED).toBe('pattern_audio_played');
    });

    it('should have PATTERN_COMPLETED', () => {
      expect(ANALYTICS_EVENTS.PATTERN_COMPLETED).toBe('pattern_completed');
    });

    it('should have LEVEL_COMPLETED', () => {
      expect(ANALYTICS_EVENTS.LEVEL_COMPLETED).toBe('level_completed');
    });
  });

  describe('Exercise events', () => {
    it('should have EXERCISE_STARTED', () => {
      expect(ANALYTICS_EVENTS.EXERCISE_STARTED).toBe('exercise_started');
    });

    it('should have EXERCISE_ANSWERED', () => {
      expect(ANALYTICS_EVENTS.EXERCISE_ANSWERED).toBe('exercise_answered');
    });

    it('should have EXERCISE_COMPLETED', () => {
      expect(ANALYTICS_EVENTS.EXERCISE_COMPLETED).toBe('exercise_completed');
    });
  });

  describe('Engagement events', () => {
    it('should have STREAK_ACHIEVED', () => {
      expect(ANALYTICS_EVENTS.STREAK_ACHIEVED).toBe('streak_achieved');
    });

    it('should have REVIEW_SESSION_STARTED', () => {
      expect(ANALYTICS_EVENTS.REVIEW_SESSION_STARTED).toBe('review_session_started');
    });

    it('should have REVIEW_SESSION_COMPLETED', () => {
      expect(ANALYTICS_EVENTS.REVIEW_SESSION_COMPLETED).toBe('review_session_completed');
    });
  });

  describe('Monetization events', () => {
    it('should have PAYWALL_VIEWED', () => {
      expect(ANALYTICS_EVENTS.PAYWALL_VIEWED).toBe('paywall_viewed');
    });

    it('should have CHECKOUT_STARTED', () => {
      expect(ANALYTICS_EVENTS.CHECKOUT_STARTED).toBe('checkout_started');
    });

    it('should have SUBSCRIPTION_STARTED', () => {
      expect(ANALYTICS_EVENTS.SUBSCRIPTION_STARTED).toBe('subscription_started');
    });

    it('should have SUBSCRIPTION_CANCELLED', () => {
      expect(ANALYTICS_EVENTS.SUBSCRIPTION_CANCELLED).toBe('subscription_cancelled');
    });
  });

  describe('Event values format', () => {
    it('should all be snake_case strings', () => {
      const snakeCaseRegex = /^[a-z]+(_[a-z]+)*$/;
      Object.values(ANALYTICS_EVENTS).forEach((value) => {
        expect(typeof value).toBe('string');
        expect(value).toMatch(snakeCaseRegex);
      });
    });

    it('should have no duplicate values', () => {
      const values = Object.values(ANALYTICS_EVENTS);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });

  describe('Total event count', () => {
    it('should have exactly 17 events', () => {
      expect(Object.keys(ANALYTICS_EVENTS)).toHaveLength(17);
    });
  });
});

describe('EVENT_CATEGORIES', () => {
  it('should have ONBOARDING category', () => {
    expect(EVENT_CATEGORIES.ONBOARDING).toContain('signup_started');
    expect(EVENT_CATEGORIES.ONBOARDING).toContain('signup_completed');
    expect(EVENT_CATEGORIES.ONBOARDING).toContain('onboarding_step');
  });

  it('should have LEARNING category', () => {
    expect(EVENT_CATEGORIES.LEARNING).toContain('pattern_viewed');
    expect(EVENT_CATEGORIES.LEARNING).toContain('pattern_audio_played');
    expect(EVENT_CATEGORIES.LEARNING).toContain('pattern_completed');
    expect(EVENT_CATEGORIES.LEARNING).toContain('level_completed');
  });

  it('should have EXERCISES category', () => {
    expect(EVENT_CATEGORIES.EXERCISES).toContain('exercise_started');
    expect(EVENT_CATEGORIES.EXERCISES).toContain('exercise_answered');
    expect(EVENT_CATEGORIES.EXERCISES).toContain('exercise_completed');
  });

  it('should have ENGAGEMENT category', () => {
    expect(EVENT_CATEGORIES.ENGAGEMENT).toContain('streak_achieved');
    expect(EVENT_CATEGORIES.ENGAGEMENT).toContain('review_session_started');
    expect(EVENT_CATEGORIES.ENGAGEMENT).toContain('review_session_completed');
  });

  it('should have MONETIZATION category', () => {
    expect(EVENT_CATEGORIES.MONETIZATION).toContain('paywall_viewed');
    expect(EVENT_CATEGORIES.MONETIZATION).toContain('checkout_started');
    expect(EVENT_CATEGORIES.MONETIZATION).toContain('subscription_started');
    expect(EVENT_CATEGORIES.MONETIZATION).toContain('subscription_cancelled');
  });

  it('should have exactly 5 categories', () => {
    expect(Object.keys(EVENT_CATEGORIES)).toHaveLength(5);
  });

  it('should cover all events', () => {
    const categoryEvents = Object.values(EVENT_CATEGORIES).flat();
    const allEvents = Object.values(ANALYTICS_EVENTS);
    expect(categoryEvents.sort()).toEqual(allEvents.sort());
  });
});

describe('AnalyticsEvent type', () => {
  it('should accept valid event values', () => {
    const event: AnalyticsEvent = 'signup_started';
    expect(event).toBe('signup_started');
  });
});
