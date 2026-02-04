import {
  normalizeDateToDay,
  getLastNDays,
  getDayLabel,
  groupByDay,
  createWeeklyChartData,
  getChartMaxValue,
  calculateBarHeight,
  calculateChartWidth,
  calculateBarX,
  hasAnyPractice,
  getWeeklySummary,
  DEFAULT_CHART_CONFIG,
  type ChartDataPoint,
} from '../progress-chart-helpers';

describe('normalizeDateToDay', () => {
  it('should return YYYY-MM-DD format', () => {
    const date = new Date('2025-01-15T14:30:00Z');
    expect(normalizeDateToDay(date)).toBe('2025-01-15');
  });

  it('should handle midnight', () => {
    const date = new Date('2025-01-15T00:00:00Z');
    expect(normalizeDateToDay(date)).toBe('2025-01-15');
  });

  it('should handle end of day', () => {
    const date = new Date('2025-01-15T23:59:59Z');
    expect(normalizeDateToDay(date)).toBe('2025-01-15');
  });
});

describe('getLastNDays', () => {
  it('should return 7 days for a week', () => {
    const refDate = new Date('2025-01-15T12:00:00Z');
    const days = getLastNDays(7, refDate);

    expect(days).toHaveLength(7);
    expect(days[0]).toBe('2025-01-09'); // 6 days ago
    expect(days[6]).toBe('2025-01-15'); // today
  });

  it('should return 1 day when requested', () => {
    const refDate = new Date('2025-01-15T12:00:00Z');
    const days = getLastNDays(1, refDate);

    expect(days).toHaveLength(1);
    expect(days[0]).toBe('2025-01-15');
  });

  it('should handle month boundaries', () => {
    const refDate = new Date('2025-02-02T12:00:00Z');
    const days = getLastNDays(7, refDate);

    expect(days[0]).toBe('2025-01-27');
    expect(days[6]).toBe('2025-02-02');
  });

  it('should return empty array for 0 days', () => {
    const days = getLastNDays(0);
    expect(days).toHaveLength(0);
  });
});

describe('getDayLabel', () => {
  it('should return short day name', () => {
    expect(getDayLabel('2025-01-13')).toBe('Mon');
    expect(getDayLabel('2025-01-14')).toBe('Tue');
    expect(getDayLabel('2025-01-15')).toBe('Wed');
    expect(getDayLabel('2025-01-16')).toBe('Thu');
    expect(getDayLabel('2025-01-17')).toBe('Fri');
    expect(getDayLabel('2025-01-18')).toBe('Sat');
    expect(getDayLabel('2025-01-19')).toBe('Sun');
  });
});

describe('groupByDay', () => {
  it('should group records by date', () => {
    const records = [
      { id: 1, created_at: '2025-01-15T10:00:00Z' },
      { id: 2, created_at: '2025-01-15T14:00:00Z' },
      { id: 3, created_at: '2025-01-16T09:00:00Z' },
    ];

    const groups = groupByDay(records, (r) => r.created_at);

    expect(groups.get('2025-01-15')).toBe(2);
    expect(groups.get('2025-01-16')).toBe(1);
  });

  it('should handle empty array', () => {
    const groups = groupByDay([], (r: { date: string }) => r.date);
    expect(groups.size).toBe(0);
  });

  it('should skip null dates', () => {
    const records = [
      { id: 1, created_at: '2025-01-15T10:00:00Z' },
      { id: 2, created_at: null },
    ];

    const groups = groupByDay(records, (r) => r.created_at);

    expect(groups.size).toBe(1);
    expect(groups.get('2025-01-15')).toBe(1);
  });

  it('should handle Date objects', () => {
    const records = [
      { id: 1, date: new Date('2025-01-15T10:00:00Z') },
      { id: 2, date: new Date('2025-01-15T14:00:00Z') },
    ];

    const groups = groupByDay(records, (r) => r.date);

    expect(groups.get('2025-01-15')).toBe(2);
  });
});

describe('createWeeklyChartData', () => {
  it('should create data for 7 days', () => {
    const dailyCounts = new Map<string, number>();
    const refDate = new Date('2025-01-15T12:00:00Z');

    const data = createWeeklyChartData(dailyCounts, refDate);

    expect(data).toHaveLength(7);
  });

  it('should include counts for days with data', () => {
    const dailyCounts = new Map<string, number>([
      ['2025-01-15', 5],
      ['2025-01-14', 3],
    ]);
    const refDate = new Date('2025-01-15T12:00:00Z');

    const data = createWeeklyChartData(dailyCounts, refDate);

    const today = data.find((d) => d.date === '2025-01-15');
    const yesterday = data.find((d) => d.date === '2025-01-14');

    expect(today?.value).toBe(5);
    expect(yesterday?.value).toBe(3);
  });

  it('should default to 0 for days without data', () => {
    const dailyCounts = new Map<string, number>();
    const refDate = new Date('2025-01-15T12:00:00Z');

    const data = createWeeklyChartData(dailyCounts, refDate);

    expect(data.every((d) => d.value === 0)).toBe(true);
  });

  it('should include day labels', () => {
    const dailyCounts = new Map<string, number>();
    const refDate = new Date('2025-01-15T12:00:00Z'); // Wednesday

    const data = createWeeklyChartData(dailyCounts, refDate);

    expect(data[6].label).toBe('Wed'); // Today
  });
});

describe('getChartMaxValue', () => {
  it('should return maximum value', () => {
    const data: ChartDataPoint[] = [
      { date: '2025-01-13', label: 'Mon', value: 3 },
      { date: '2025-01-14', label: 'Tue', value: 10 },
      { date: '2025-01-15', label: 'Wed', value: 5 },
    ];

    expect(getChartMaxValue(data)).toBe(10);
  });

  it('should return 1 for all zeros', () => {
    const data: ChartDataPoint[] = [
      { date: '2025-01-13', label: 'Mon', value: 0 },
      { date: '2025-01-14', label: 'Tue', value: 0 },
    ];

    expect(getChartMaxValue(data)).toBe(1);
  });

  it('should return 1 for empty array', () => {
    expect(getChartMaxValue([])).toBe(1);
  });
});

describe('calculateBarHeight', () => {
  it('should calculate proportional height', () => {
    expect(calculateBarHeight(50, 100, 200)).toBe(100);
    expect(calculateBarHeight(25, 100, 200)).toBe(50);
  });

  it('should return 0 for zero value', () => {
    expect(calculateBarHeight(0, 100, 200)).toBe(0);
  });

  it('should return 0 for zero max value', () => {
    expect(calculateBarHeight(50, 0, 200)).toBe(0);
  });

  it('should return max height for max value', () => {
    expect(calculateBarHeight(100, 100, 200)).toBe(200);
  });

  it('should round to integer', () => {
    expect(calculateBarHeight(33, 100, 100)).toBe(33);
  });
});

describe('calculateChartWidth', () => {
  it('should calculate width based on config', () => {
    const config = { maxHeight: 100, barWidth: 30, barGap: 10 };
    // 7 bars * 30 + 6 gaps * 10 = 210 + 60 = 270
    expect(calculateChartWidth(7, config)).toBe(270);
  });

  it('should use default config', () => {
    // 7 bars * 30 + 6 gaps * 8 = 210 + 48 = 258
    expect(calculateChartWidth(7)).toBe(258);
  });

  it('should return 0 for 0 data points', () => {
    expect(calculateChartWidth(0)).toBe(0);
  });

  it('should return bar width for 1 data point', () => {
    expect(calculateChartWidth(1)).toBe(DEFAULT_CHART_CONFIG.barWidth);
  });
});

describe('calculateBarX', () => {
  it('should calculate x position', () => {
    const config = { maxHeight: 100, barWidth: 30, barGap: 10 };

    expect(calculateBarX(0, config)).toBe(0);
    expect(calculateBarX(1, config)).toBe(40);
    expect(calculateBarX(2, config)).toBe(80);
  });

  it('should use default config', () => {
    expect(calculateBarX(0)).toBe(0);
    expect(calculateBarX(1)).toBe(38); // 30 + 8
  });
});

describe('hasAnyPractice', () => {
  it('should return false for all zeros', () => {
    const data: ChartDataPoint[] = [
      { date: '2025-01-13', label: 'Mon', value: 0 },
      { date: '2025-01-14', label: 'Tue', value: 0 },
    ];

    expect(hasAnyPractice(data)).toBe(false);
  });

  it('should return true if any value > 0', () => {
    const data: ChartDataPoint[] = [
      { date: '2025-01-13', label: 'Mon', value: 0 },
      { date: '2025-01-14', label: 'Tue', value: 1 },
    ];

    expect(hasAnyPractice(data)).toBe(true);
  });

  it('should return false for empty array', () => {
    expect(hasAnyPractice([])).toBe(false);
  });
});

describe('getWeeklySummary', () => {
  it('should return "No practice" for all zeros', () => {
    const data: ChartDataPoint[] = [
      { date: '2025-01-13', label: 'Mon', value: 0 },
      { date: '2025-01-14', label: 'Tue', value: 0 },
    ];

    expect(getWeeklySummary(data)).toBe('No practice this week');
  });

  it('should return singular form for 1', () => {
    const data: ChartDataPoint[] = [
      { date: '2025-01-13', label: 'Mon', value: 1 },
      { date: '2025-01-14', label: 'Tue', value: 0 },
    ];

    expect(getWeeklySummary(data)).toBe('1 exercise this week');
  });

  it('should return plural form for multiple', () => {
    const data: ChartDataPoint[] = [
      { date: '2025-01-13', label: 'Mon', value: 5 },
      { date: '2025-01-14', label: 'Tue', value: 10 },
    ];

    expect(getWeeklySummary(data)).toBe('15 exercises this week');
  });
});
