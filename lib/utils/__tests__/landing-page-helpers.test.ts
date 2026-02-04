import {
  HERO_HEADLINE,
  HERO_SUBHEADLINE,
  DEMO_SENTENCE,
  DEMO_TRANSCRIPTION,
  COUNTRY_FLAGS,
  PROBLEM_POINTS,
  HOW_IT_WORKS_STEPS,
  getHowItWorksSteps,
  getProblemPoints,
  getCountryFlags,
  getCtaButtonText,
  getCtaButtonHref,
} from '../landing-page-helpers';

describe('HERO_HEADLINE', () => {
  it('should be a non-empty string', () => {
    expect(typeof HERO_HEADLINE).toBe('string');
    expect(HERO_HEADLINE.length).toBeGreaterThan(0);
  });

  it('should mention understanding native speakers', () => {
    expect(HERO_HEADLINE.toLowerCase()).toContain('native');
  });
});

describe('HERO_SUBHEADLINE', () => {
  it('should be a non-empty string', () => {
    expect(typeof HERO_SUBHEADLINE).toBe('string');
    expect(HERO_SUBHEADLINE.length).toBeGreaterThan(0);
  });

  it('should mention patterns', () => {
    expect(HERO_SUBHEADLINE.toLowerCase()).toContain('pattern');
  });
});

describe('DEMO_SENTENCE', () => {
  it('should be a non-empty string', () => {
    expect(typeof DEMO_SENTENCE).toBe('string');
    expect(DEMO_SENTENCE.length).toBeGreaterThan(0);
  });
});

describe('DEMO_TRANSCRIPTION', () => {
  it('should be a non-empty string', () => {
    expect(typeof DEMO_TRANSCRIPTION).toBe('string');
    expect(DEMO_TRANSCRIPTION.length).toBeGreaterThan(0);
  });

  it('should be different from DEMO_SENTENCE', () => {
    expect(DEMO_TRANSCRIPTION).not.toBe(DEMO_SENTENCE);
  });
});

describe('COUNTRY_FLAGS', () => {
  it('should have 6 countries', () => {
    expect(COUNTRY_FLAGS).toHaveLength(6);
  });

  it('should have emoji and country for each entry', () => {
    for (const flag of COUNTRY_FLAGS) {
      expect(flag.emoji).toBeDefined();
      expect(flag.country).toBeDefined();
      expect(flag.emoji.length).toBeGreaterThan(0);
      expect(flag.country.length).toBeGreaterThan(0);
    }
  });

  it('should include India', () => {
    const india = COUNTRY_FLAGS.find((f) => f.country === 'India');
    expect(india).toBeDefined();
    expect(india?.emoji).toBe('🇮🇳');
  });

  it('should include Brazil', () => {
    const brazil = COUNTRY_FLAGS.find((f) => f.country === 'Brazil');
    expect(brazil).toBeDefined();
    expect(brazil?.emoji).toBe('🇧🇷');
  });
});

describe('PROBLEM_POINTS', () => {
  it('should have at least 3 points', () => {
    expect(PROBLEM_POINTS.length).toBeGreaterThanOrEqual(3);
  });

  it('should all be non-empty strings', () => {
    for (const point of PROBLEM_POINTS) {
      expect(typeof point).toBe('string');
      expect(point.length).toBeGreaterThan(0);
    }
  });
});

describe('HOW_IT_WORKS_STEPS', () => {
  it('should have 3 steps', () => {
    expect(HOW_IT_WORKS_STEPS).toHaveLength(3);
  });

  it('should have sequential numbers starting from 1', () => {
    expect(HOW_IT_WORKS_STEPS[0].number).toBe(1);
    expect(HOW_IT_WORKS_STEPS[1].number).toBe(2);
    expect(HOW_IT_WORKS_STEPS[2].number).toBe(3);
  });

  it('should have title and description for each step', () => {
    for (const step of HOW_IT_WORKS_STEPS) {
      expect(step.title).toBeDefined();
      expect(step.description).toBeDefined();
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.description.length).toBeGreaterThan(0);
    }
  });
});

describe('getHowItWorksSteps', () => {
  it('should return HOW_IT_WORKS_STEPS', () => {
    expect(getHowItWorksSteps()).toBe(HOW_IT_WORKS_STEPS);
  });

  it('should return 3 steps', () => {
    expect(getHowItWorksSteps()).toHaveLength(3);
  });
});

describe('getProblemPoints', () => {
  it('should return PROBLEM_POINTS', () => {
    expect(getProblemPoints()).toBe(PROBLEM_POINTS);
  });

  it('should return at least 3 points', () => {
    expect(getProblemPoints().length).toBeGreaterThanOrEqual(3);
  });
});

describe('getCountryFlags', () => {
  it('should return COUNTRY_FLAGS', () => {
    expect(getCountryFlags()).toBe(COUNTRY_FLAGS);
  });

  it('should return 6 flags', () => {
    expect(getCountryFlags()).toHaveLength(6);
  });
});

describe('getCtaButtonText', () => {
  it('should return "Start Learning Free" when not logged in', () => {
    expect(getCtaButtonText(false)).toBe('Start Learning Free');
  });

  it('should return "Go to Dashboard" when logged in', () => {
    expect(getCtaButtonText(true)).toBe('Go to Dashboard');
  });
});

describe('getCtaButtonHref', () => {
  it('should return "/signup" when not logged in', () => {
    expect(getCtaButtonHref(false)).toBe('/signup');
  });

  it('should return "/dashboard" when logged in', () => {
    expect(getCtaButtonHref(true)).toBe('/dashboard');
  });
});
