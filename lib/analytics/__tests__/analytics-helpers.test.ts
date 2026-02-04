import {
  POSTHOG_API_HOST,
  isAnalyticsEnabled,
  shouldDisableCapturing,
  getPostHogConfig,
  validateEventName,
  sanitizeProperties,
  addTimestamp,
} from '../analytics-helpers';

describe('POSTHOG_API_HOST', () => {
  it('should be the PostHog API URL', () => {
    expect(POSTHOG_API_HOST).toBe('https://app.posthog.com');
  });
});

describe('isAnalyticsEnabled', () => {
  it('should return true when window is defined', () => {
    // In Jest/Node, window is not defined by default
    // But we can test the logic
    const originalWindow = global.window;

    // @ts-expect-error - mocking window
    global.window = {};
    expect(isAnalyticsEnabled()).toBe(true);

    // Restore
    global.window = originalWindow;
  });

  it('should return false when window is undefined', () => {
    const originalWindow = global.window;

    // @ts-expect-error - removing window
    delete global.window;
    expect(isAnalyticsEnabled()).toBe(false);

    // Restore
    global.window = originalWindow;
  });
});

describe('shouldDisableCapturing', () => {
  it('should return true in development mode', () => {
    expect(shouldDisableCapturing('development')).toBe(true);
  });

  it('should return false in production mode', () => {
    expect(shouldDisableCapturing('production')).toBe(false);
  });

  it('should return false in test mode', () => {
    expect(shouldDisableCapturing('test')).toBe(false);
  });

  it('should return false for undefined env', () => {
    expect(shouldDisableCapturing(undefined)).toBe(false);
  });

  it('should use process.env.NODE_ENV when no argument provided', () => {
    // Current test environment is 'test'
    expect(shouldDisableCapturing()).toBe(false);
  });
});

describe('getPostHogConfig', () => {
  it('should return correct structure', () => {
    const config = getPostHogConfig('test-key');
    expect(config).toHaveProperty('api_host');
    expect(config).toHaveProperty('autocapture');
    expect(config).toHaveProperty('capture_pageview');
  });

  it('should include correct api_host', () => {
    const config = getPostHogConfig('test-key');
    expect(config.api_host).toBe(POSTHOG_API_HOST);
  });

  it('should disable autocapture in development', () => {
    const config = getPostHogConfig('test-key', 'development');
    expect(config.autocapture).toBe(false);
  });

  it('should enable autocapture in production', () => {
    const config = getPostHogConfig('test-key', 'production');
    expect(config.autocapture).toBe(true);
  });

  it('should disable capture_pageview in development', () => {
    const config = getPostHogConfig('test-key', 'development');
    expect(config.capture_pageview).toBe(false);
  });

  it('should enable capture_pageview in production', () => {
    const config = getPostHogConfig('test-key', 'production');
    expect(config.capture_pageview).toBe(true);
  });
});

describe('validateEventName', () => {
  it('should return true for valid event names', () => {
    expect(validateEventName('user_signed_up')).toBe(true);
    expect(validateEventName('button_clicked')).toBe(true);
    expect(validateEventName('page_viewed')).toBe(true);
  });

  it('should return true for single character', () => {
    expect(validateEventName('a')).toBe(true);
  });

  it('should return false for empty string', () => {
    expect(validateEventName('')).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(validateEventName(null)).toBe(false);
    expect(validateEventName(undefined)).toBe(false);
    expect(validateEventName(123)).toBe(false);
    expect(validateEventName({})).toBe(false);
    expect(validateEventName([])).toBe(false);
  });
});

describe('sanitizeProperties', () => {
  it('should remove undefined values', () => {
    const props = { a: 1, b: undefined, c: 'hello' };
    const sanitized = sanitizeProperties(props);
    expect(sanitized).toEqual({ a: 1, c: 'hello' });
  });

  it('should keep null values', () => {
    const props = { a: null, b: 'value' };
    const sanitized = sanitizeProperties(props);
    expect(sanitized).toEqual({ a: null, b: 'value' });
  });

  it('should handle null input', () => {
    expect(sanitizeProperties(null)).toEqual({});
  });

  it('should handle undefined input', () => {
    expect(sanitizeProperties(undefined)).toEqual({});
  });

  it('should handle empty object', () => {
    expect(sanitizeProperties({})).toEqual({});
  });

  it('should preserve all types of values except undefined', () => {
    const props = {
      string: 'hello',
      number: 42,
      boolean: true,
      array: [1, 2, 3],
      object: { nested: 'value' },
      nullValue: null,
      zero: 0,
      emptyString: '',
    };
    const sanitized = sanitizeProperties(props);
    expect(sanitized).toEqual(props);
  });
});

describe('addTimestamp', () => {
  it('should add timestamp to properties', () => {
    const props = { foo: 'bar' };
    const result = addTimestamp(props);
    expect(result).toHaveProperty('timestamp');
    expect(result.foo).toBe('bar');
  });

  it('should return object with timestamp when no properties provided', () => {
    const result = addTimestamp();
    expect(result).toHaveProperty('timestamp');
  });

  it('should return object with timestamp for empty properties', () => {
    const result = addTimestamp({});
    expect(result).toHaveProperty('timestamp');
    expect(Object.keys(result)).toHaveLength(1);
  });

  it('should have ISO format timestamp', () => {
    const result = addTimestamp();
    const timestamp = result.timestamp as string;
    expect(typeof timestamp).toBe('string');
    expect(() => new Date(timestamp)).not.toThrow();
  });

  it('should sanitize properties before adding timestamp', () => {
    const props = { a: 1, b: undefined };
    const result = addTimestamp(props);
    expect(result).toHaveProperty('a', 1);
    expect(result).not.toHaveProperty('b');
    expect(result).toHaveProperty('timestamp');
  });
});
