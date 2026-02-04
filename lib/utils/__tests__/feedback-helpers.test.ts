import {
  CORRECT_MESSAGES,
  INCORRECT_MESSAGES,
  getEncouragementMessage,
  getFeedbackTitle,
  getIncorrectExplanation,
  getExerciseTip,
  shouldShowUserAnswer,
  shouldShowCorrectAnswer,
  createFeedbackData,
  FeedbackData,
} from '../feedback-helpers';
import type { ExerciseType } from '@/types/exercise';

describe('CORRECT_MESSAGES', () => {
  it('should contain positive messages', () => {
    expect(CORRECT_MESSAGES.length).toBeGreaterThan(0);
    CORRECT_MESSAGES.forEach((message) => {
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });
  });

  it('should have at least 5 messages', () => {
    expect(CORRECT_MESSAGES.length).toBeGreaterThanOrEqual(5);
  });
});

describe('INCORRECT_MESSAGES', () => {
  it('should contain encouraging messages', () => {
    expect(INCORRECT_MESSAGES.length).toBeGreaterThan(0);
    INCORRECT_MESSAGES.forEach((message) => {
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });
  });

  it('should have at least 5 messages', () => {
    expect(INCORRECT_MESSAGES.length).toBeGreaterThanOrEqual(5);
  });
});

describe('getEncouragementMessage', () => {
  it('should return a message from CORRECT_MESSAGES when correct', () => {
    const message = getEncouragementMessage(true);
    expect(CORRECT_MESSAGES).toContain(message);
  });

  it('should return a message from INCORRECT_MESSAGES when incorrect', () => {
    const message = getEncouragementMessage(false);
    expect(INCORRECT_MESSAGES).toContain(message);
  });

  it('should return deterministic message with seed for correct', () => {
    const message0 = getEncouragementMessage(true, 0);
    const message1 = getEncouragementMessage(true, 1);
    const message0Again = getEncouragementMessage(true, 0);

    expect(message0).toBe(CORRECT_MESSAGES[0]);
    expect(message1).toBe(CORRECT_MESSAGES[1]);
    expect(message0Again).toBe(message0);
  });

  it('should return deterministic message with seed for incorrect', () => {
    const message0 = getEncouragementMessage(false, 0);
    const message1 = getEncouragementMessage(false, 1);

    expect(message0).toBe(INCORRECT_MESSAGES[0]);
    expect(message1).toBe(INCORRECT_MESSAGES[1]);
  });

  it('should wrap around with large seed values', () => {
    const message = getEncouragementMessage(true, CORRECT_MESSAGES.length);
    expect(message).toBe(CORRECT_MESSAGES[0]);
  });
});

describe('getFeedbackTitle', () => {
  it('should return "Correct!" for correct answers', () => {
    expect(getFeedbackTitle(true)).toBe('Correct!');
  });

  it('should return "Not Quite" for incorrect answers', () => {
    expect(getFeedbackTitle(false)).toBe('Not Quite');
  });
});

describe('getIncorrectExplanation', () => {
  it('should return comparison-specific explanation', () => {
    const explanation = getIncorrectExplanation('comparison', 'answer');
    expect(explanation).toContain('slow');
    expect(explanation).toContain('fast');
  });

  it('should return discrimination-specific explanation with answer', () => {
    const explanation = getIncorrectExplanation('discrimination', 'wanna');
    expect(explanation).toContain('wanna');
    expect(explanation).toContain('correct answer');
  });

  it('should return dictation-specific explanation with answer', () => {
    const explanation = getIncorrectExplanation('dictation', 'I wanna go');
    expect(explanation).toContain('I wanna go');
    expect(explanation).toContain('transcription');
  });

  it('should return speed-specific explanation', () => {
    const explanation = getIncorrectExplanation('speed', 'answer');
    expect(explanation).toContain('speed');
    expect(explanation).toContain('gradually');
  });

  it('should return generic explanation for unknown types', () => {
    const explanation = getIncorrectExplanation('unknown' as ExerciseType, 'answer');
    expect(explanation).toContain('answer');
  });
});

describe('getExerciseTip', () => {
  it('should return comparison-specific tip', () => {
    const tip = getExerciseTip('comparison');
    expect(tip.length).toBeGreaterThan(0);
    expect(tip).toContain('blend');
  });

  it('should return discrimination-specific tip', () => {
    const tip = getExerciseTip('discrimination');
    expect(tip.length).toBeGreaterThan(0);
    expect(tip).toContain('ear');
  });

  it('should return dictation-specific tip', () => {
    const tip = getExerciseTip('dictation');
    expect(tip.length).toBeGreaterThan(0);
    expect(tip).toContain('spelling');
  });

  it('should return speed-specific tip', () => {
    const tip = getExerciseTip('speed');
    expect(tip.length).toBeGreaterThan(0);
    expect(tip).toContain('practice');
  });

  it('should return generic tip for unknown types', () => {
    const tip = getExerciseTip('unknown' as ExerciseType);
    expect(tip.length).toBeGreaterThan(0);
  });
});

describe('shouldShowUserAnswer', () => {
  it('should return false when userAnswer is undefined', () => {
    expect(shouldShowUserAnswer('dictation', undefined)).toBe(false);
  });

  it('should return false when userAnswer is empty string', () => {
    expect(shouldShowUserAnswer('dictation', '')).toBe(false);
  });

  it('should return true for dictation with answer', () => {
    expect(shouldShowUserAnswer('dictation', 'user answer')).toBe(true);
  });

  it('should return true for discrimination with answer', () => {
    expect(shouldShowUserAnswer('discrimination', 'option A')).toBe(true);
  });

  it('should return false for comparison even with answer', () => {
    expect(shouldShowUserAnswer('comparison', 'some answer')).toBe(false);
  });

  it('should return false for speed even with answer', () => {
    expect(shouldShowUserAnswer('speed', 'some answer')).toBe(false);
  });
});

describe('shouldShowCorrectAnswer', () => {
  it('should return false when answer is correct', () => {
    expect(shouldShowCorrectAnswer(true, 'dictation')).toBe(false);
    expect(shouldShowCorrectAnswer(true, 'discrimination')).toBe(false);
  });

  it('should return true for dictation when incorrect', () => {
    expect(shouldShowCorrectAnswer(false, 'dictation')).toBe(true);
  });

  it('should return true for discrimination when incorrect', () => {
    expect(shouldShowCorrectAnswer(false, 'discrimination')).toBe(true);
  });

  it('should return false for comparison when incorrect', () => {
    expect(shouldShowCorrectAnswer(false, 'comparison')).toBe(false);
  });

  it('should return false for speed when incorrect', () => {
    expect(shouldShowCorrectAnswer(false, 'speed')).toBe(false);
  });
});

describe('createFeedbackData', () => {
  it('should create basic feedback data', () => {
    const data = createFeedbackData(
      true,
      'dictation',
      'Want to → Wanna',
      'I wanna go'
    );

    expect(data.isCorrect).toBe(true);
    expect(data.exerciseType).toBe('dictation');
    expect(data.patternTitle).toBe('Want to → Wanna');
    expect(data.correctAnswer).toBe('I wanna go');
    expect(data.userAnswer).toBeUndefined();
  });

  it('should include user answer when provided', () => {
    const data = createFeedbackData(
      false,
      'dictation',
      'Want to → Wanna',
      'I wanna go',
      'I want to go'
    );

    expect(data.userAnswer).toBe('I want to go');
  });

  it('should include pattern explanation when provided', () => {
    const data = createFeedbackData(
      true,
      'discrimination',
      'Pattern Title',
      'answer',
      undefined,
      'This pattern involves...'
    );

    expect(data.patternExplanation).toBe('This pattern involves...');
  });

  it('should include highlighted patterns when provided', () => {
    const data = createFeedbackData(
      false,
      'dictation',
      'Pattern',
      'I wanna go',
      'I want to go',
      undefined,
      ['wanna']
    );

    expect(data.highlightedPatterns).toEqual(['wanna']);
  });

  it('should create complete feedback data with all fields', () => {
    const data = createFeedbackData(
      false,
      'dictation',
      'Want to → Wanna',
      'I wanna go home',
      'I want to go home',
      'The pattern reduces "want to" to "wanna"',
      ['wanna', 'go home']
    );

    expect(data).toEqual({
      isCorrect: false,
      exerciseType: 'dictation',
      userAnswer: 'I want to go home',
      correctAnswer: 'I wanna go home',
      patternTitle: 'Want to → Wanna',
      patternExplanation: 'The pattern reduces "want to" to "wanna"',
      highlightedPatterns: ['wanna', 'go home'],
    });
  });
});

describe('FeedbackData interface', () => {
  it('should have correct shape with required fields', () => {
    const data: FeedbackData = {
      isCorrect: true,
      exerciseType: 'comparison',
      correctAnswer: 'answer',
      patternTitle: 'Pattern',
    };

    expect(data.isCorrect).toBe(true);
    expect(data.exerciseType).toBe('comparison');
    expect(data.correctAnswer).toBe('answer');
    expect(data.patternTitle).toBe('Pattern');
  });

  it('should have correct shape with all fields', () => {
    const data: FeedbackData = {
      isCorrect: false,
      exerciseType: 'dictation',
      userAnswer: 'user input',
      correctAnswer: 'correct',
      patternTitle: 'Pattern Title',
      patternExplanation: 'Explanation text',
      highlightedPatterns: ['pattern1', 'pattern2'],
    };

    expect(Object.keys(data)).toHaveLength(7);
  });
});
