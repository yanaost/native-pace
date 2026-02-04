import {
  normalizeToDay,
  daysBetween,
  isSameDay,
  isNextDay,
  shouldStreakContinue,
  hasPracticedToday,
  calculateStreakUpdate,
  createStreakUpdateData,
  formatStreakText,
  getStreakMotivationMessage,
} from '../streak-helpers';

describe('normalizeToDay', () => {
  it('should normalize to midnight UTC', () => {
    const date = new Date('2025-01-15T14:30:00Z');
    const normalized = normalizeToDay(date);

    expect(normalized.getUTCHours()).toBe(0);
    expect(normalized.getUTCMinutes()).toBe(0);
    expect(normalized.getUTCSeconds()).toBe(0);
    expect(normalized.getUTCMilliseconds()).toBe(0);
  });

  it('should preserve date', () => {
    const date = new Date('2025-01-15T23:59:59Z');
    const normalized = normalizeToDay(date);

    expect(normalized.getUTCFullYear()).toBe(2025);
    expect(normalized.getUTCMonth()).toBe(0); // January
    expect(normalized.getUTCDate()).toBe(15);
  });

  it('should handle midnight correctly', () => {
    const date = new Date('2025-01-15T00:00:00Z');
    const normalized = normalizeToDay(date);

    expect(normalized.getTime()).toBe(date.getTime());
  });
});

describe('daysBetween', () => {
  it('should return 0 for same day', () => {
    const date1 = new Date('2025-01-15T10:00:00Z');
    const date2 = new Date('2025-01-15T20:00:00Z');

    expect(daysBetween(date1, date2)).toBe(0);
  });

  it('should return 1 for consecutive days', () => {
    const date1 = new Date('2025-01-15T10:00:00Z');
    const date2 = new Date('2025-01-16T10:00:00Z');

    expect(daysBetween(date1, date2)).toBe(1);
  });

  it('should return negative for date1 after date2', () => {
    const date1 = new Date('2025-01-16T10:00:00Z');
    const date2 = new Date('2025-01-15T10:00:00Z');

    expect(daysBetween(date1, date2)).toBe(-1);
  });

  it('should handle multiple days', () => {
    const date1 = new Date('2025-01-15T00:00:00Z');
    const date2 = new Date('2025-01-20T00:00:00Z');

    expect(daysBetween(date1, date2)).toBe(5);
  });

  it('should handle month boundaries', () => {
    const date1 = new Date('2025-01-31T00:00:00Z');
    const date2 = new Date('2025-02-01T00:00:00Z');

    expect(daysBetween(date1, date2)).toBe(1);
  });
});

describe('isSameDay', () => {
  it('should return true for same day different times', () => {
    const date1 = new Date('2025-01-15T00:00:00Z');
    const date2 = new Date('2025-01-15T23:59:59Z');

    expect(isSameDay(date1, date2)).toBe(true);
  });

  it('should return false for different days', () => {
    const date1 = new Date('2025-01-15T23:59:59Z');
    const date2 = new Date('2025-01-16T00:00:00Z');

    expect(isSameDay(date1, date2)).toBe(false);
  });
});

describe('isNextDay', () => {
  it('should return true for consecutive days', () => {
    const date1 = new Date('2025-01-15T10:00:00Z');
    const date2 = new Date('2025-01-16T10:00:00Z');

    expect(isNextDay(date1, date2)).toBe(true);
  });

  it('should return false for same day', () => {
    const date1 = new Date('2025-01-15T10:00:00Z');
    const date2 = new Date('2025-01-15T20:00:00Z');

    expect(isNextDay(date1, date2)).toBe(false);
  });

  it('should return false for two days apart', () => {
    const date1 = new Date('2025-01-15T10:00:00Z');
    const date2 = new Date('2025-01-17T10:00:00Z');

    expect(isNextDay(date1, date2)).toBe(false);
  });
});

describe('shouldStreakContinue', () => {
  it('should return false for null last practice date', () => {
    const currentDate = new Date('2025-01-15T10:00:00Z');
    expect(shouldStreakContinue(null, currentDate)).toBe(false);
  });

  it('should return true if practiced today', () => {
    const lastPractice = '2025-01-15T08:00:00Z';
    const currentDate = new Date('2025-01-15T16:00:00Z');

    expect(shouldStreakContinue(lastPractice, currentDate)).toBe(true);
  });

  it('should return true if practiced yesterday', () => {
    const lastPractice = '2025-01-14T20:00:00Z';
    const currentDate = new Date('2025-01-15T10:00:00Z');

    expect(shouldStreakContinue(lastPractice, currentDate)).toBe(true);
  });

  it('should return false if missed a day', () => {
    const lastPractice = '2025-01-13T10:00:00Z';
    const currentDate = new Date('2025-01-15T10:00:00Z');

    expect(shouldStreakContinue(lastPractice, currentDate)).toBe(false);
  });

  it('should return false if multiple days missed', () => {
    const lastPractice = '2025-01-10T10:00:00Z';
    const currentDate = new Date('2025-01-15T10:00:00Z');

    expect(shouldStreakContinue(lastPractice, currentDate)).toBe(false);
  });

  it('should return false if last practice is in the future', () => {
    const lastPractice = '2025-01-20T10:00:00Z';
    const currentDate = new Date('2025-01-15T10:00:00Z');

    expect(shouldStreakContinue(lastPractice, currentDate)).toBe(false);
  });
});

describe('hasPracticedToday', () => {
  it('should return false for null last practice date', () => {
    const currentDate = new Date('2025-01-15T10:00:00Z');
    expect(hasPracticedToday(null, currentDate)).toBe(false);
  });

  it('should return true if practiced same day', () => {
    const lastPractice = '2025-01-15T08:00:00Z';
    const currentDate = new Date('2025-01-15T16:00:00Z');

    expect(hasPracticedToday(lastPractice, currentDate)).toBe(true);
  });

  it('should return false if practiced yesterday', () => {
    const lastPractice = '2025-01-14T20:00:00Z';
    const currentDate = new Date('2025-01-15T10:00:00Z');

    expect(hasPracticedToday(lastPractice, currentDate)).toBe(false);
  });
});

describe('calculateStreakUpdate', () => {
  describe('first practice ever', () => {
    it('should start streak at 1', () => {
      const result = calculateStreakUpdate(
        0,
        0,
        null,
        new Date('2025-01-15T10:00:00Z')
      );

      expect(result.newCurrentStreak).toBe(1);
      expect(result.newLongestStreak).toBe(1);
      expect(result.streakContinued).toBe(false);
      expect(result.streakBroken).toBe(false);
      expect(result.isNewRecord).toBe(true);
    });
  });

  describe('already practiced today', () => {
    it('should not change streak', () => {
      const result = calculateStreakUpdate(
        5,
        10,
        '2025-01-15T08:00:00Z',
        new Date('2025-01-15T16:00:00Z')
      );

      expect(result.newCurrentStreak).toBe(5);
      expect(result.newLongestStreak).toBe(10);
      expect(result.streakContinued).toBe(true);
      expect(result.streakBroken).toBe(false);
      expect(result.isNewRecord).toBe(false);
    });
  });

  describe('streak continues', () => {
    it('should increment streak when practiced yesterday', () => {
      const result = calculateStreakUpdate(
        5,
        10,
        '2025-01-14T10:00:00Z',
        new Date('2025-01-15T10:00:00Z')
      );

      expect(result.newCurrentStreak).toBe(6);
      expect(result.newLongestStreak).toBe(10);
      expect(result.streakContinued).toBe(true);
      expect(result.streakBroken).toBe(false);
    });

    it('should update longest streak when setting new record', () => {
      const result = calculateStreakUpdate(
        10,
        10,
        '2025-01-14T10:00:00Z',
        new Date('2025-01-15T10:00:00Z')
      );

      expect(result.newCurrentStreak).toBe(11);
      expect(result.newLongestStreak).toBe(11);
      expect(result.isNewRecord).toBe(true);
    });
  });

  describe('streak breaks', () => {
    it('should reset to 1 when day is missed', () => {
      const result = calculateStreakUpdate(
        5,
        10,
        '2025-01-13T10:00:00Z',
        new Date('2025-01-15T10:00:00Z')
      );

      expect(result.newCurrentStreak).toBe(1);
      expect(result.newLongestStreak).toBe(10);
      expect(result.streakContinued).toBe(false);
      expect(result.streakBroken).toBe(true);
    });

    it('should not mark as broken if no previous streak', () => {
      const result = calculateStreakUpdate(
        0,
        5,
        '2025-01-10T10:00:00Z',
        new Date('2025-01-15T10:00:00Z')
      );

      expect(result.streakBroken).toBe(false);
    });
  });
});

describe('createStreakUpdateData', () => {
  it('should create database update object', () => {
    const result = {
      newCurrentStreak: 5,
      newLongestStreak: 10,
      streakContinued: true,
      streakBroken: false,
      isNewRecord: false,
    };
    const practiceDate = new Date('2025-01-15T14:30:00Z');

    const updateData = createStreakUpdateData(result, practiceDate);

    expect(updateData.streak_current).toBe(5);
    expect(updateData.streak_longest).toBe(10);
    expect(updateData.last_practice_date).toBe('2025-01-15T00:00:00.000Z');
  });

  it('should normalize practice date to midnight', () => {
    const result = {
      newCurrentStreak: 1,
      newLongestStreak: 1,
      streakContinued: false,
      streakBroken: false,
      isNewRecord: true,
    };
    const practiceDate = new Date('2025-01-15T23:59:59Z');

    const updateData = createStreakUpdateData(result, practiceDate);

    expect(updateData.last_practice_date).toBe('2025-01-15T00:00:00.000Z');
  });
});

describe('formatStreakText', () => {
  it('should return "No streak" for 0', () => {
    expect(formatStreakText(0)).toBe('No streak');
  });

  it('should return singular form for 1', () => {
    expect(formatStreakText(1)).toBe('1 day streak');
  });

  it('should return plural form for 2+', () => {
    expect(formatStreakText(2)).toBe('2 day streak');
    expect(formatStreakText(7)).toBe('7 day streak');
    expect(formatStreakText(30)).toBe('30 day streak');
  });
});

describe('getStreakMotivationMessage', () => {
  it('should return start message for 0 streak', () => {
    expect(getStreakMotivationMessage(0, false)).toContain('Start');
  });

  it('should return first day message for 1 day streak', () => {
    expect(getStreakMotivationMessage(1, false)).toContain('tomorrow');
  });

  it('should return building message for 3 day streak', () => {
    expect(getStreakMotivationMessage(3, false)).toContain('momentum');
  });

  it('should return week message for 7 day streak', () => {
    expect(getStreakMotivationMessage(7, false)).toContain('week');
  });

  it('should return two week message for 14 day streak', () => {
    expect(getStreakMotivationMessage(14, false)).toContain('Two weeks');
  });

  it('should return month message for 30 day streak', () => {
    expect(getStreakMotivationMessage(30, false)).toContain('month');
  });

  it('should return new record message when applicable', () => {
    expect(getStreakMotivationMessage(5, true)).toContain('personal best');
  });

  it('should not return new record message for streak of 1', () => {
    expect(getStreakMotivationMessage(1, true)).not.toContain('personal best');
  });
});
