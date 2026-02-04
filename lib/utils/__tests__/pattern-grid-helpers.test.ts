import {
  getMasteryLevel,
  getMasteryColor,
  getMasteryLevelLabel,
  createPatternGridItem,
  groupPatternsByCategory,
  createProgressMap,
  countByMasteryLevel,
  getLegendItems,
  MASTERY_COLORS,
  MASTERY_THRESHOLDS,
  CATEGORY_ORDER,
  type MasteryLevel,
  type PatternGridItem,
} from '../pattern-grid-helpers';
import type { PatternCategory } from '@/types/pattern';

describe('getMasteryLevel', () => {
  it('should return "not-started" for 0', () => {
    expect(getMasteryLevel(0)).toBe('not-started');
  });

  it('should return "learning" for 1-49', () => {
    expect(getMasteryLevel(1)).toBe('learning');
    expect(getMasteryLevel(25)).toBe('learning');
    expect(getMasteryLevel(49)).toBe('learning');
  });

  it('should return "practiced" for 50-79', () => {
    expect(getMasteryLevel(50)).toBe('practiced');
    expect(getMasteryLevel(65)).toBe('practiced');
    expect(getMasteryLevel(79)).toBe('practiced');
  });

  it('should return "mastered" for 80+', () => {
    expect(getMasteryLevel(80)).toBe('mastered');
    expect(getMasteryLevel(90)).toBe('mastered');
    expect(getMasteryLevel(100)).toBe('mastered');
  });
});

describe('getMasteryColor', () => {
  it('should return gray for 0', () => {
    expect(getMasteryColor(0)).toBe(MASTERY_COLORS['not-started']);
  });

  it('should return yellow for learning', () => {
    expect(getMasteryColor(25)).toBe(MASTERY_COLORS['learning']);
  });

  it('should return light green for practiced', () => {
    expect(getMasteryColor(60)).toBe(MASTERY_COLORS['practiced']);
  });

  it('should return green for mastered', () => {
    expect(getMasteryColor(85)).toBe(MASTERY_COLORS['mastered']);
  });
});

describe('getMasteryLevelLabel', () => {
  it('should return correct labels', () => {
    expect(getMasteryLevelLabel('not-started')).toBe('Not Started');
    expect(getMasteryLevelLabel('learning')).toBe('Learning');
    expect(getMasteryLevelLabel('practiced')).toBe('Practiced');
    expect(getMasteryLevelLabel('mastered')).toBe('Mastered');
  });
});

describe('createPatternGridItem', () => {
  it('should create item with correct properties', () => {
    const item = createPatternGridItem('pattern-1', 75);

    expect(item.patternId).toBe('pattern-1');
    expect(item.masteryScore).toBe(75);
    expect(item.masteryLevel).toBe('practiced');
    expect(item.color).toBe(MASTERY_COLORS['practiced']);
  });

  it('should handle zero score', () => {
    const item = createPatternGridItem('pattern-2', 0);

    expect(item.masteryLevel).toBe('not-started');
    expect(item.color).toBe(MASTERY_COLORS['not-started']);
  });

  it('should handle mastered score', () => {
    const item = createPatternGridItem('pattern-3', 95);

    expect(item.masteryLevel).toBe('mastered');
    expect(item.color).toBe(MASTERY_COLORS['mastered']);
  });
});

describe('groupPatternsByCategory', () => {
  it('should group patterns by category', () => {
    const patterns = [
      { id: 'p1', category: 'weak-forms' as PatternCategory },
      { id: 'p2', category: 'weak-forms' as PatternCategory },
      { id: 'p3', category: 'reductions' as PatternCategory },
    ];
    const progressMap = new Map([
      ['p1', 50],
      ['p2', 80],
      ['p3', 0],
    ]);

    const groups = groupPatternsByCategory(patterns, progressMap);

    expect(groups).toHaveLength(2);
    expect(groups[0].category).toBe('weak-forms');
    expect(groups[0].patterns).toHaveLength(2);
    expect(groups[1].category).toBe('reductions');
    expect(groups[1].patterns).toHaveLength(1);
  });

  it('should use CATEGORY_ORDER for sorting', () => {
    const patterns = [
      { id: 'p1', category: 'flapping' as PatternCategory },
      { id: 'p2', category: 'weak-forms' as PatternCategory },
      { id: 'p3', category: 'linking' as PatternCategory },
    ];
    const progressMap = new Map<string, number>();

    const groups = groupPatternsByCategory(patterns, progressMap);

    expect(groups[0].category).toBe('weak-forms');
    expect(groups[1].category).toBe('linking');
    expect(groups[2].category).toBe('flapping');
  });

  it('should default to 0 mastery for missing progress', () => {
    const patterns = [{ id: 'p1', category: 'weak-forms' as PatternCategory }];
    const progressMap = new Map<string, number>();

    const groups = groupPatternsByCategory(patterns, progressMap);

    expect(groups[0].patterns[0].masteryScore).toBe(0);
    expect(groups[0].patterns[0].masteryLevel).toBe('not-started');
  });

  it('should include display names', () => {
    const patterns = [{ id: 'p1', category: 'weak-forms' as PatternCategory }];
    const progressMap = new Map<string, number>();

    const groups = groupPatternsByCategory(patterns, progressMap);

    expect(groups[0].displayName).toBe('Weak Forms');
  });

  it('should handle empty patterns array', () => {
    const groups = groupPatternsByCategory([], new Map());
    expect(groups).toHaveLength(0);
  });
});

describe('createProgressMap', () => {
  it('should create map from progress records', () => {
    const records = [
      { pattern_id: 'p1', mastery_score: 50 },
      { pattern_id: 'p2', mastery_score: 75 },
    ];

    const map = createProgressMap(records);

    expect(map.get('p1')).toBe(50);
    expect(map.get('p2')).toBe(75);
  });

  it('should handle empty array', () => {
    const map = createProgressMap([]);
    expect(map.size).toBe(0);
  });

  it('should overwrite duplicates with last value', () => {
    const records = [
      { pattern_id: 'p1', mastery_score: 50 },
      { pattern_id: 'p1', mastery_score: 75 },
    ];

    const map = createProgressMap(records);

    expect(map.get('p1')).toBe(75);
  });
});

describe('countByMasteryLevel', () => {
  it('should count items by level', () => {
    const items: PatternGridItem[] = [
      { patternId: 'p1', masteryScore: 0, masteryLevel: 'not-started', color: '' },
      { patternId: 'p2', masteryScore: 25, masteryLevel: 'learning', color: '' },
      { patternId: 'p3', masteryScore: 50, masteryLevel: 'practiced', color: '' },
      { patternId: 'p4', masteryScore: 60, masteryLevel: 'practiced', color: '' },
      { patternId: 'p5', masteryScore: 90, masteryLevel: 'mastered', color: '' },
    ];

    const counts = countByMasteryLevel(items);

    expect(counts['not-started']).toBe(1);
    expect(counts['learning']).toBe(1);
    expect(counts['practiced']).toBe(2);
    expect(counts['mastered']).toBe(1);
  });

  it('should return all zeros for empty array', () => {
    const counts = countByMasteryLevel([]);

    expect(counts['not-started']).toBe(0);
    expect(counts['learning']).toBe(0);
    expect(counts['practiced']).toBe(0);
    expect(counts['mastered']).toBe(0);
  });
});

describe('getLegendItems', () => {
  it('should return 4 legend items', () => {
    const items = getLegendItems();
    expect(items).toHaveLength(4);
  });

  it('should include all mastery levels', () => {
    const items = getLegendItems();
    const levels = items.map((i) => i.level);

    expect(levels).toContain('mastered');
    expect(levels).toContain('practiced');
    expect(levels).toContain('learning');
    expect(levels).toContain('not-started');
  });

  it('should have correct colors', () => {
    const items = getLegendItems();
    const masteredItem = items.find((i) => i.level === 'mastered');

    expect(masteredItem?.color).toBe(MASTERY_COLORS['mastered']);
  });
});

describe('MASTERY_THRESHOLDS', () => {
  it('should have correct threshold values', () => {
    expect(MASTERY_THRESHOLDS.MASTERED).toBe(80);
    expect(MASTERY_THRESHOLDS.PRACTICED).toBe(50);
    expect(MASTERY_THRESHOLDS.LEARNING).toBe(1);
  });
});

describe('CATEGORY_ORDER', () => {
  it('should contain all 6 categories', () => {
    expect(CATEGORY_ORDER).toHaveLength(6);
  });

  it('should start with weak-forms', () => {
    expect(CATEGORY_ORDER[0]).toBe('weak-forms');
  });

  it('should end with flapping', () => {
    expect(CATEGORY_ORDER[5]).toBe('flapping');
  });
});
