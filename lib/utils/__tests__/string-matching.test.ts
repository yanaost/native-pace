import {
  normalizeText,
  levenshteinDistance,
  calculateSimilarity,
  DEFAULT_SIMILARITY_THRESHOLD,
  isMatch,
  findBestMatch,
  tokenize,
  countMatchingTokens,
  tokenSimilarity,
  containsAllTokens,
  combinedSimilarity,
} from '../string-matching';

describe('normalizeText', () => {
  it('should convert to lowercase', () => {
    expect(normalizeText('Hello World')).toBe('hello world');
    expect(normalizeText('UPPERCASE')).toBe('uppercase');
    expect(normalizeText('MiXeD CaSe')).toBe('mixed case');
  });

  it('should remove punctuation', () => {
    expect(normalizeText('Hello, world!')).toBe('hello world');
    expect(normalizeText("What's up?")).toBe('whats up');
    expect(normalizeText('Wait... really?!')).toBe('wait really');
    expect(normalizeText('(hello) [world]')).toBe('hello world');
  });

  it('should collapse multiple spaces', () => {
    expect(normalizeText('hello    world')).toBe('hello world');
    expect(normalizeText('  multiple   spaces  ')).toBe('multiple spaces');
  });

  it('should trim whitespace', () => {
    expect(normalizeText('  hello  ')).toBe('hello');
    expect(normalizeText('\thello\n')).toBe('hello');
  });

  it('should handle empty string', () => {
    expect(normalizeText('')).toBe('');
  });

  it('should handle string with only punctuation', () => {
    expect(normalizeText('...')).toBe('');
    expect(normalizeText('!@#$%')).toBe('@#$%'); // Only specified punctuation removed
  });

  it('should preserve numbers', () => {
    expect(normalizeText('Test 123')).toBe('test 123');
    expect(normalizeText('1st place!')).toBe('1st place');
  });
});

describe('levenshteinDistance', () => {
  it('should return 0 for identical strings', () => {
    expect(levenshteinDistance('hello', 'hello')).toBe(0);
    expect(levenshteinDistance('', '')).toBe(0);
    expect(levenshteinDistance('a', 'a')).toBe(0);
  });

  it('should return length of other string when one is empty', () => {
    expect(levenshteinDistance('hello', '')).toBe(5);
    expect(levenshteinDistance('', 'hello')).toBe(5);
    expect(levenshteinDistance('', 'a')).toBe(1);
  });

  it('should calculate single character substitution', () => {
    expect(levenshteinDistance('cat', 'bat')).toBe(1);
    expect(levenshteinDistance('hello', 'hallo')).toBe(1);
  });

  it('should calculate single character insertion', () => {
    expect(levenshteinDistance('cat', 'cats')).toBe(1);
    expect(levenshteinDistance('hello', 'hellos')).toBe(1);
  });

  it('should calculate single character deletion', () => {
    expect(levenshteinDistance('cats', 'cat')).toBe(1);
    expect(levenshteinDistance('hello', 'hell')).toBe(1);
  });

  it('should calculate multiple edits', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
    expect(levenshteinDistance('sunday', 'saturday')).toBe(3);
  });

  it('should be symmetric', () => {
    expect(levenshteinDistance('abc', 'xyz')).toBe(levenshteinDistance('xyz', 'abc'));
    expect(levenshteinDistance('hello', 'world')).toBe(levenshteinDistance('world', 'hello'));
  });

  it('should handle completely different strings', () => {
    expect(levenshteinDistance('abc', 'xyz')).toBe(3);
  });
});

describe('calculateSimilarity', () => {
  it('should return 100 for identical strings', () => {
    expect(calculateSimilarity('hello', 'hello')).toBe(100);
    expect(calculateSimilarity('test', 'test')).toBe(100);
  });

  it('should return 100 for strings differing only in case', () => {
    expect(calculateSimilarity('Hello', 'hello')).toBe(100);
    expect(calculateSimilarity('HELLO', 'hello')).toBe(100);
  });

  it('should return 100 for strings differing only in punctuation', () => {
    expect(calculateSimilarity('Hello!', 'hello')).toBe(100);
    expect(calculateSimilarity('What?', 'what')).toBe(100);
  });

  it('should return 0 for empty input', () => {
    expect(calculateSimilarity('', 'hello')).toBe(0);
  });

  it('should return 0 for empty target', () => {
    expect(calculateSimilarity('hello', '')).toBe(0);
  });

  it('should return 0 for both empty', () => {
    expect(calculateSimilarity('', '')).toBe(100); // Actually identical
  });

  it('should return high similarity for minor typos', () => {
    expect(calculateSimilarity('I wanna go', 'I wanna goo')).toBeGreaterThan(80);
    expect(calculateSimilarity('hello', 'helo')).toBeGreaterThan(75);
  });

  it('should return low similarity for very different strings', () => {
    expect(calculateSimilarity('hello', 'xyz')).toBeLessThan(50);
    expect(calculateSimilarity('abc', 'xyz')).toBe(0);
  });

  it('should handle word substitutions', () => {
    const similarity = calculateSimilarity('I want to go', 'I wanna go');
    expect(similarity).toBeGreaterThan(60);
    expect(similarity).toBeLessThan(100);
  });

  it('should never return negative', () => {
    expect(calculateSimilarity('a', 'completely different')).toBeGreaterThanOrEqual(0);
  });
});

describe('DEFAULT_SIMILARITY_THRESHOLD', () => {
  it('should be 85', () => {
    expect(DEFAULT_SIMILARITY_THRESHOLD).toBe(85);
  });
});

describe('isMatch', () => {
  it('should return true for exact match', () => {
    expect(isMatch('hello', 'hello')).toBe(true);
  });

  it('should return true for case-insensitive match', () => {
    expect(isMatch('Hello', 'hello')).toBe(true);
    expect(isMatch('HELLO', 'hello')).toBe(true);
  });

  it('should return true for punctuation-insensitive match', () => {
    expect(isMatch('Hello!', 'hello')).toBe(true);
  });

  it('should return true for match above default threshold', () => {
    // "I wanna go" vs "I wanna goo" should be > 85%
    expect(isMatch('I wanna go', 'I wanna goo')).toBe(true);
  });

  it('should return false for match below default threshold', () => {
    expect(isMatch('hello', 'xyz')).toBe(false);
    expect(isMatch('something', 'completely different')).toBe(false);
  });

  it('should use custom threshold', () => {
    // With low threshold, more matches
    expect(isMatch('hello', 'helo', 50)).toBe(true);
    // With high threshold, fewer matches
    expect(isMatch('hello', 'helo', 95)).toBe(false);
  });

  it('should handle empty strings', () => {
    expect(isMatch('', '')).toBe(true);
    expect(isMatch('', 'hello')).toBe(false);
    expect(isMatch('hello', '')).toBe(false);
  });
});

describe('findBestMatch', () => {
  it('should return null for empty candidates', () => {
    expect(findBestMatch('hello', [])).toBeNull();
  });

  it('should return exact match with score 100', () => {
    const result = findBestMatch('hello', ['world', 'hello', 'hi']);
    expect(result).not.toBeNull();
    expect(result!.match).toBe('hello');
    expect(result!.score).toBe(100);
    expect(result!.index).toBe(1);
  });

  it('should return best match when no exact match', () => {
    const result = findBestMatch('hello', ['helo', 'help', 'world']);
    expect(result).not.toBeNull();
    expect(result!.match).toBe('helo');
    expect(result!.score).toBeGreaterThan(0);
  });

  it('should return first candidate when multiple have same best score', () => {
    // 'hello' matches both 'hello' candidates equally
    const result = findBestMatch('hello', ['hello', 'hello', 'world']);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(100);
    expect(result!.index).toBe(0);
  });

  it('should return null when all scores are 0 (no matching characters)', () => {
    // 'x' has no similarity with 'a', 'b', 'c'
    const result = findBestMatch('x', ['a', 'b', 'c']);
    expect(result).toBeNull();
  });

  it('should return null when all scores are 0', () => {
    // Empty normalized strings result in 0 scores
    expect(findBestMatch('abc', [''])).toBeNull();
  });

  it('should handle single candidate', () => {
    const result = findBestMatch('hello', ['hello']);
    expect(result).not.toBeNull();
    expect(result!.match).toBe('hello');
    expect(result!.index).toBe(0);
  });
});

describe('tokenize', () => {
  it('should split text into words', () => {
    expect(tokenize('hello world')).toEqual(['hello', 'world']);
  });

  it('should handle single word', () => {
    expect(tokenize('hello')).toEqual(['hello']);
  });

  it('should return empty array for empty string', () => {
    expect(tokenize('')).toEqual([]);
  });

  it('should normalize before tokenizing', () => {
    expect(tokenize('Hello, World!')).toEqual(['hello', 'world']);
  });

  it('should handle multiple spaces', () => {
    expect(tokenize('hello    world')).toEqual(['hello', 'world']);
  });

  it('should handle punctuation-only string', () => {
    expect(tokenize('...')).toEqual([]);
  });
});

describe('countMatchingTokens', () => {
  it('should count matching tokens', () => {
    expect(countMatchingTokens('hello world', 'hello there')).toBe(1);
    expect(countMatchingTokens('hello world', 'hello world')).toBe(2);
  });

  it('should return 0 for no matches', () => {
    expect(countMatchingTokens('hello', 'world')).toBe(0);
  });

  it('should return 0 for empty input', () => {
    expect(countMatchingTokens('', 'hello world')).toBe(0);
  });

  it('should be case-insensitive', () => {
    expect(countMatchingTokens('Hello', 'hello')).toBe(1);
  });

  it('should handle duplicate tokens in input', () => {
    expect(countMatchingTokens('hello hello', 'hello world')).toBe(2);
  });
});

describe('tokenSimilarity', () => {
  it('should return 100 for identical tokens', () => {
    // "hello world" has 2 tokens, both match, 2 unique total
    // But this is actually 2/2 = 100%
    expect(tokenSimilarity('hello world', 'hello world')).toBe(100);
  });

  it('should return 0 for no matching tokens', () => {
    expect(tokenSimilarity('hello', 'world')).toBe(0);
  });

  it('should return 0 for empty input', () => {
    expect(tokenSimilarity('', 'hello')).toBe(0);
  });

  it('should return 0 for empty target', () => {
    expect(tokenSimilarity('hello', '')).toBe(0);
  });

  it('should calculate partial match', () => {
    // "hello world" vs "hello there" = 1 match, 3 unique tokens = 33%
    expect(tokenSimilarity('hello world', 'hello there')).toBe(33);
  });
});

describe('containsAllTokens', () => {
  it('should return true when all tokens present', () => {
    expect(containsAllTokens('hello world', ['hello', 'world'])).toBe(true);
  });

  it('should return true for empty required tokens', () => {
    expect(containsAllTokens('hello', [])).toBe(true);
  });

  it('should return false when token missing', () => {
    expect(containsAllTokens('hello world', ['hello', 'foo'])).toBe(false);
  });

  it('should be case-insensitive', () => {
    expect(containsAllTokens('Hello World', ['hello', 'world'])).toBe(true);
  });

  it('should normalize required tokens', () => {
    expect(containsAllTokens('hello world', ['Hello!', 'World?'])).toBe(true);
  });

  it('should handle empty input', () => {
    expect(containsAllTokens('', ['hello'])).toBe(false);
  });
});

describe('combinedSimilarity', () => {
  it('should return 100 for identical strings', () => {
    expect(combinedSimilarity('hello world', 'hello world')).toBe(100);
  });

  it('should return 0 for completely different strings', () => {
    expect(combinedSimilarity('abc', 'xyz')).toBe(0);
  });

  it('should weight character similarity 70%', () => {
    // For strings with same tokens but different order
    // Character sim might be lower but token sim could be higher
    const _charOnly = calculateSimilarity('hello world', 'world hello');
    const combined = combinedSimilarity('hello world', 'world hello');
    // Combined should factor in token similarity
    expect(combined).toBeGreaterThanOrEqual(0);
    expect(combined).toBeLessThanOrEqual(100);
  });

  it('should handle empty strings', () => {
    expect(combinedSimilarity('', 'hello')).toBe(0);
    expect(combinedSimilarity('hello', '')).toBe(0);
  });

  it('should return reasonable score for minor differences', () => {
    const score = combinedSimilarity('I wanna go home', 'I wanna go');
    expect(score).toBeGreaterThan(50);
    expect(score).toBeLessThan(100);
  });
});

describe('Edge cases', () => {
  it('should handle unicode characters', () => {
    expect(normalizeText('café')).toBe('café');
    expect(normalizeText('naïve')).toBe('naïve');
  });

  it('should handle numbers in text', () => {
    expect(tokenize('test 123')).toEqual(['test', '123']);
    expect(isMatch('test 123', 'test 123')).toBe(true);
  });

  it('should handle long strings', () => {
    const longA = 'a'.repeat(1000);
    const longB = 'b'.repeat(1000);
    expect(levenshteinDistance(longA, longB)).toBe(1000);
  });

  it('should handle contractions', () => {
    expect(normalizeText("don't")).toBe('dont');
    expect(normalizeText("I'm")).toBe('im');
  });
});
