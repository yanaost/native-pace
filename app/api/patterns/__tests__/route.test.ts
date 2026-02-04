import { parseQueryParams } from '../route';

describe('parseQueryParams', () => {
  describe('level parameter', () => {
    it('should parse valid level (1-6)', () => {
      const params = new URLSearchParams('level=1');
      const result = parseQueryParams(params);

      expect(result.level).toBe(1);
      expect(result.errors).toHaveLength(0);
    });

    it('should parse level 6', () => {
      const params = new URLSearchParams('level=6');
      const result = parseQueryParams(params);

      expect(result.level).toBe(6);
      expect(result.errors).toHaveLength(0);
    });

    it('should return null for missing level', () => {
      const params = new URLSearchParams('');
      const result = parseQueryParams(params);

      expect(result.level).toBeNull();
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for level 0', () => {
      const params = new URLSearchParams('level=0');
      const result = parseQueryParams(params);

      expect(result.level).toBeNull();
      expect(result.errors).toContain('level must be a number between 1 and 6');
    });

    it('should return error for level 7', () => {
      const params = new URLSearchParams('level=7');
      const result = parseQueryParams(params);

      expect(result.level).toBeNull();
      expect(result.errors).toContain('level must be a number between 1 and 6');
    });

    it('should return error for non-numeric level', () => {
      const params = new URLSearchParams('level=abc');
      const result = parseQueryParams(params);

      expect(result.level).toBeNull();
      expect(result.errors).toContain('level must be a number between 1 and 6');
    });

    it('should return error for negative level', () => {
      const params = new URLSearchParams('level=-1');
      const result = parseQueryParams(params);

      expect(result.level).toBeNull();
      expect(result.errors).toContain('level must be a number between 1 and 6');
    });
  });

  describe('category parameter', () => {
    it('should parse valid category "reductions"', () => {
      const params = new URLSearchParams('category=reductions');
      const result = parseQueryParams(params);

      expect(result.category).toBe('reductions');
      expect(result.errors).toHaveLength(0);
    });

    it('should parse valid category "weak-forms"', () => {
      const params = new URLSearchParams('category=weak-forms');
      const result = parseQueryParams(params);

      expect(result.category).toBe('weak-forms');
      expect(result.errors).toHaveLength(0);
    });

    it('should parse valid category "linking"', () => {
      const params = new URLSearchParams('category=linking');
      const result = parseQueryParams(params);

      expect(result.category).toBe('linking');
      expect(result.errors).toHaveLength(0);
    });

    it('should parse valid category "elision"', () => {
      const params = new URLSearchParams('category=elision');
      const result = parseQueryParams(params);

      expect(result.category).toBe('elision');
      expect(result.errors).toHaveLength(0);
    });

    it('should parse valid category "assimilation"', () => {
      const params = new URLSearchParams('category=assimilation');
      const result = parseQueryParams(params);

      expect(result.category).toBe('assimilation');
      expect(result.errors).toHaveLength(0);
    });

    it('should parse valid category "flapping"', () => {
      const params = new URLSearchParams('category=flapping');
      const result = parseQueryParams(params);

      expect(result.category).toBe('flapping');
      expect(result.errors).toHaveLength(0);
    });

    it('should return null for missing category', () => {
      const params = new URLSearchParams('');
      const result = parseQueryParams(params);

      expect(result.category).toBeNull();
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for invalid category', () => {
      const params = new URLSearchParams('category=invalid');
      const result = parseQueryParams(params);

      expect(result.category).toBeNull();
      expect(result.errors[0]).toContain('category must be one of:');
    });
  });

  describe('page parameter', () => {
    it('should default to page 1 when not provided', () => {
      const params = new URLSearchParams('');
      const result = parseQueryParams(params);

      expect(result.page).toBe(1);
      expect(result.errors).toHaveLength(0);
    });

    it('should parse valid page number', () => {
      const params = new URLSearchParams('page=5');
      const result = parseQueryParams(params);

      expect(result.page).toBe(5);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for page 0', () => {
      const params = new URLSearchParams('page=0');
      const result = parseQueryParams(params);

      expect(result.page).toBe(1); // defaults back
      expect(result.errors).toContain('page must be a positive integer');
    });

    it('should return error for negative page', () => {
      const params = new URLSearchParams('page=-1');
      const result = parseQueryParams(params);

      expect(result.page).toBe(1); // defaults back
      expect(result.errors).toContain('page must be a positive integer');
    });

    it('should return error for non-numeric page', () => {
      const params = new URLSearchParams('page=abc');
      const result = parseQueryParams(params);

      expect(result.page).toBe(1); // defaults back
      expect(result.errors).toContain('page must be a positive integer');
    });
  });

  describe('limit parameter', () => {
    it('should default to limit 20 when not provided', () => {
      const params = new URLSearchParams('');
      const result = parseQueryParams(params);

      expect(result.limit).toBe(20);
      expect(result.errors).toHaveLength(0);
    });

    it('should parse valid limit', () => {
      const params = new URLSearchParams('limit=50');
      const result = parseQueryParams(params);

      expect(result.limit).toBe(50);
      expect(result.errors).toHaveLength(0);
    });

    it('should cap limit at 100', () => {
      const params = new URLSearchParams('limit=200');
      const result = parseQueryParams(params);

      expect(result.limit).toBe(100);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for limit 0', () => {
      const params = new URLSearchParams('limit=0');
      const result = parseQueryParams(params);

      expect(result.limit).toBe(20); // defaults back
      expect(result.errors).toContain('limit must be a positive integer');
    });

    it('should return error for negative limit', () => {
      const params = new URLSearchParams('limit=-10');
      const result = parseQueryParams(params);

      expect(result.limit).toBe(20); // defaults back
      expect(result.errors).toContain('limit must be a positive integer');
    });

    it('should return error for non-numeric limit', () => {
      const params = new URLSearchParams('limit=abc');
      const result = parseQueryParams(params);

      expect(result.limit).toBe(20); // defaults back
      expect(result.errors).toContain('limit must be a positive integer');
    });
  });

  describe('combined parameters', () => {
    it('should parse all valid parameters together', () => {
      const params = new URLSearchParams('level=2&category=reductions&page=3&limit=10');
      const result = parseQueryParams(params);

      expect(result.level).toBe(2);
      expect(result.category).toBe('reductions');
      expect(result.page).toBe(3);
      expect(result.limit).toBe(10);
      expect(result.errors).toHaveLength(0);
    });

    it('should collect multiple errors', () => {
      const params = new URLSearchParams('level=10&category=invalid&page=0&limit=-5');
      const result = parseQueryParams(params);

      expect(result.errors).toHaveLength(4);
      expect(result.errors).toContain('level must be a number between 1 and 6');
      expect(result.errors[1]).toContain('category must be one of:');
      expect(result.errors).toContain('page must be a positive integer');
      expect(result.errors).toContain('limit must be a positive integer');
    });

    it('should handle partial valid parameters', () => {
      const params = new URLSearchParams('level=3&category=invalid');
      const result = parseQueryParams(params);

      expect(result.level).toBe(3);
      expect(result.category).toBeNull();
      expect(result.errors).toHaveLength(1);
    });
  });
});
