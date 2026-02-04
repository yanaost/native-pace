/**
 * Landing Page Helpers
 *
 * Constants and utility functions for the landing page.
 */

/** Hero section content */
export const HERO_HEADLINE = 'Finally understand native English speakers';
export const HERO_SUBHEADLINE = 'Learn the 185 sound patterns that textbooks don\'t teach';

/** Audio demo content */
export const DEMO_SENTENCE = 'What do you want to do?';
export const DEMO_TRANSCRIPTION = 'Whaddya wanna do?';

/** Country flags for social proof */
export interface CountryFlag {
  emoji: string;
  country: string;
}

export const COUNTRY_FLAGS: CountryFlag[] = [
  { emoji: '🇮🇳', country: 'India' },
  { emoji: '🇧🇷', country: 'Brazil' },
  { emoji: '🇻🇳', country: 'Vietnam' },
  { emoji: '🇮🇩', country: 'Indonesia' },
  { emoji: '🇲🇽', country: 'Mexico' },
  { emoji: '🇵🇱', country: 'Poland' },
];

/** Problem points explaining why learners struggle */
export const PROBLEM_POINTS: string[] = [
  'You\'ve studied English for years but still can\'t understand movies or podcasts',
  'Native speakers talk too fast and words seem to blur together',
  'Textbooks teach "dictionary pronunciation" but natives speak differently',
];

/** How it works step */
export interface HowItWorksStep {
  number: number;
  title: string;
  description: string;
}

/** Steps explaining how the app works */
export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    number: 1,
    title: 'Listen to patterns',
    description: 'Hear the difference between slow, clear speech and natural native speed',
  },
  {
    number: 2,
    title: 'Practice recognition',
    description: 'Train your ear to identify patterns in real speech',
  },
  {
    number: 3,
    title: 'Build comprehension',
    description: 'Use spaced repetition to master all 185 patterns',
  },
];

/**
 * Gets the how it works steps.
 *
 * @returns Array of steps
 */
export function getHowItWorksSteps(): HowItWorksStep[] {
  return HOW_IT_WORKS_STEPS;
}

/**
 * Gets the problem points.
 *
 * @returns Array of problem statements
 */
export function getProblemPoints(): string[] {
  return PROBLEM_POINTS;
}

/**
 * Gets the country flags for social proof.
 *
 * @returns Array of country flag objects
 */
export function getCountryFlags(): CountryFlag[] {
  return COUNTRY_FLAGS;
}

/**
 * Gets the CTA button text.
 *
 * @param isLoggedIn - Whether user is logged in
 * @returns Button text
 */
export function getCtaButtonText(isLoggedIn: boolean): string {
  return isLoggedIn ? 'Go to Dashboard' : 'Start Learning Free';
}

/**
 * Gets the CTA button href.
 *
 * @param isLoggedIn - Whether user is logged in
 * @returns Navigation path
 */
export function getCtaButtonHref(isLoggedIn: boolean): string {
  return isLoggedIn ? '/dashboard' : '/signup';
}
