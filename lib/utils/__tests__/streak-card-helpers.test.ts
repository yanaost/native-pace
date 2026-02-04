import {
  getStreakEmoji,
  shouldShowLongestStreak,
  shouldShowNewRecordBadge,
} from '../streak-card-helpers';

describe('getStreakEmoji', () => {
  it('should return fire emoji for positive streak', () => {
    expect(getStreakEmoji(1)).toBe('🔥');
    expect(getStreakEmoji(5)).toBe('🔥');
    expect(getStreakEmoji(100)).toBe('🔥');
  });

  it('should return sleeping emoji for zero streak', () => {
    expect(getStreakEmoji(0)).toBe('💤');
  });

  it('should return sleeping emoji for negative streak', () => {
    expect(getStreakEmoji(-1)).toBe('💤');
  });
});

describe('shouldShowLongestStreak', () => {
  it('should return false when longestStreak is undefined', () => {
    expect(shouldShowLongestStreak(5, undefined)).toBe(false);
  });

  it('should return false when longest equals current', () => {
    expect(shouldShowLongestStreak(5, 5)).toBe(false);
  });

  it('should return false when longest is less than current', () => {
    expect(shouldShowLongestStreak(10, 5)).toBe(false);
  });

  it('should return true when longest is greater than current', () => {
    expect(shouldShowLongestStreak(5, 10)).toBe(true);
  });

  it('should return true when current is 0 and longest exists', () => {
    expect(shouldShowLongestStreak(0, 7)).toBe(true);
  });
});

describe('shouldShowNewRecordBadge', () => {
  it('should return false when not a new record', () => {
    expect(shouldShowNewRecordBadge(false, 5)).toBe(false);
  });

  it('should return false for new record with streak of 1', () => {
    expect(shouldShowNewRecordBadge(true, 1)).toBe(false);
  });

  it('should return false for new record with streak of 0', () => {
    expect(shouldShowNewRecordBadge(true, 0)).toBe(false);
  });

  it('should return true for new record with streak > 1', () => {
    expect(shouldShowNewRecordBadge(true, 2)).toBe(true);
    expect(shouldShowNewRecordBadge(true, 10)).toBe(true);
    expect(shouldShowNewRecordBadge(true, 100)).toBe(true);
  });
});
