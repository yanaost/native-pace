import {
  SENTRY_DSN_KEY,
  DEFAULT_SAMPLE_RATE,
  PRODUCTION_ERROR_SAMPLE_RATE,
  SOURCE_MAP_URL_PREFIX,
  IGNORED_ERROR_PATTERNS,
  SENSITIVE_KEYS,
  isMonitoringEnabled,
  getSentryConfig,
  isIgnoredError,
  shouldCaptureError,
  getErrorMessage,
  isSensitiveKey,
  sanitizeErrorData,
  enrichErrorContext,
  getErrorFingerprint,
  getSourceMapConfig,
  isValidDsn,
  getEnvironmentName,
  buildReleaseString,
} from '../sentry-helpers';

describe('Constants', () => {
  it('should have SENTRY_DSN_KEY', () => {
    expect(SENTRY_DSN_KEY).toBe('NEXT_PUBLIC_SENTRY_DSN');
  });

  it('should have DEFAULT_SAMPLE_RATE at 0.1', () => {
    expect(DEFAULT_SAMPLE_RATE).toBe(0.1);
  });

  it('should have PRODUCTION_ERROR_SAMPLE_RATE at 1.0', () => {
    expect(PRODUCTION_ERROR_SAMPLE_RATE).toBe(1.0);
  });

  it('should have SOURCE_MAP_URL_PREFIX', () => {
    expect(SOURCE_MAP_URL_PREFIX).toBe('~/_next');
  });
});

describe('IGNORED_ERROR_PATTERNS', () => {
  it('should include browser extension patterns', () => {
    expect(IGNORED_ERROR_PATTERNS).toContain('chrome-extension://');
    expect(IGNORED_ERROR_PATTERNS).toContain('moz-extension://');
  });

  it('should include network error patterns', () => {
    expect(IGNORED_ERROR_PATTERNS).toContain('Network request failed');
    expect(IGNORED_ERROR_PATTERNS).toContain('Failed to fetch');
  });

  it('should include abort patterns', () => {
    expect(IGNORED_ERROR_PATTERNS).toContain('AbortError');
  });

  it('should include ResizeObserver', () => {
    expect(IGNORED_ERROR_PATTERNS).toContain('ResizeObserver loop');
  });
});

describe('SENSITIVE_KEYS', () => {
  it('should include password', () => {
    expect(SENSITIVE_KEYS).toContain('password');
  });

  it('should include token', () => {
    expect(SENSITIVE_KEYS).toContain('token');
  });

  it('should include email', () => {
    expect(SENSITIVE_KEYS).toContain('email');
  });

  it('should include apiKey variations', () => {
    expect(SENSITIVE_KEYS).toContain('apiKey');
    expect(SENSITIVE_KEYS).toContain('api_key');
  });
});

describe('isMonitoringEnabled', () => {
  it('should return false without DSN', () => {
    expect(isMonitoringEnabled({})).toBe(false);
    expect(isMonitoringEnabled({ dsn: '' })).toBe(false);
  });

  it('should return false in development without debug', () => {
    expect(isMonitoringEnabled({
      dsn: 'https://key@sentry.io/123',
      isDevelopment: true,
    })).toBe(false);
  });

  it('should return true in development with debug', () => {
    expect(isMonitoringEnabled({
      dsn: 'https://key@sentry.io/123',
      isDevelopment: true,
      debug: true,
    })).toBe(true);
  });

  it('should return true in production with DSN', () => {
    expect(isMonitoringEnabled({
      dsn: 'https://key@sentry.io/123',
      isDevelopment: false,
    })).toBe(true);
  });
});

describe('getSentryConfig', () => {
  it('should return disabled config without DSN', () => {
    const config = getSentryConfig({});
    expect(config.enabled).toBe(false);
  });

  it('should return correct config for production', () => {
    const config = getSentryConfig({
      dsn: 'https://key@sentry.io/123',
      environment: 'production',
    });

    expect(config.dsn).toBe('https://key@sentry.io/123');
    expect(config.environment).toBe('production');
    expect(config.enabled).toBe(true);
    expect(config.tracesSampleRate).toBe(DEFAULT_SAMPLE_RATE);
    expect(config.replaysSessionSampleRate).toBe(0.1);
    expect(config.replaysOnErrorSampleRate).toBe(1.0);
  });

  it('should return correct config for development', () => {
    const config = getSentryConfig({
      dsn: 'https://key@sentry.io/123',
      environment: 'development',
      debug: true,
    });

    expect(config.environment).toBe('development');
    expect(config.tracesSampleRate).toBe(1.0);
    expect(config.debug).toBe(true);
  });

  it('should include release if provided', () => {
    const config = getSentryConfig({
      dsn: 'https://key@sentry.io/123',
      release: '1.0.0-abc1234',
    });

    expect(config.release).toBe('1.0.0-abc1234');
  });

  it('should default environment to development', () => {
    const config = getSentryConfig({});
    expect(config.environment).toBe('development');
  });
});

describe('isIgnoredError', () => {
  it('should ignore browser extension errors', () => {
    expect(isIgnoredError(new Error('chrome-extension://abc/error'))).toBe(true);
    expect(isIgnoredError(new Error('moz-extension://xyz/error'))).toBe(true);
  });

  it('should ignore network errors', () => {
    expect(isIgnoredError(new Error('Network request failed'))).toBe(true);
    expect(isIgnoredError(new Error('Failed to fetch'))).toBe(true);
    expect(isIgnoredError(new Error('Load failed'))).toBe(true);
  });

  it('should ignore abort errors', () => {
    expect(isIgnoredError(new Error('AbortError'))).toBe(true);
    expect(isIgnoredError(new Error('The operation was aborted'))).toBe(true);
  });

  it('should ignore ResizeObserver errors', () => {
    expect(isIgnoredError(new Error('ResizeObserver loop limit exceeded'))).toBe(true);
  });

  it('should ignore chunk loading errors', () => {
    expect(isIgnoredError(new Error('Loading chunk 123 failed'))).toBe(true);
    expect(isIgnoredError(new Error('ChunkLoadError: chunk failed'))).toBe(true);
  });

  it('should not ignore legitimate errors', () => {
    expect(isIgnoredError(new Error('TypeError: undefined is not a function'))).toBe(false);
    expect(isIgnoredError(new Error('ReferenceError: foo is not defined'))).toBe(false);
  });

  it('should handle string errors', () => {
    expect(isIgnoredError('Failed to fetch')).toBe(true);
    expect(isIgnoredError('Real error')).toBe(false);
  });
});

describe('shouldCaptureError', () => {
  it('should return false for null/undefined', () => {
    expect(shouldCaptureError(null)).toBe(false);
    expect(shouldCaptureError(undefined)).toBe(false);
  });

  it('should return false for ignored errors', () => {
    expect(shouldCaptureError(new Error('Failed to fetch'))).toBe(false);
  });

  it('should return true for legitimate errors', () => {
    expect(shouldCaptureError(new Error('Database connection failed'))).toBe(true);
  });
});

describe('getErrorMessage', () => {
  it('should return empty string for null/undefined', () => {
    expect(getErrorMessage(null)).toBe('');
    expect(getErrorMessage(undefined)).toBe('');
  });

  it('should return string as-is', () => {
    expect(getErrorMessage('error message')).toBe('error message');
  });

  it('should extract message from Error', () => {
    expect(getErrorMessage(new Error('test error'))).toBe('test error');
  });

  it('should extract message from object', () => {
    expect(getErrorMessage({ message: 'object error' })).toBe('object error');
  });

  it('should stringify other types', () => {
    expect(getErrorMessage(123)).toBe('123');
  });
});

describe('isSensitiveKey', () => {
  it('should detect password keys', () => {
    expect(isSensitiveKey('password')).toBe(true);
    expect(isSensitiveKey('userPassword')).toBe(true);
    expect(isSensitiveKey('PASSWORD')).toBe(true);
  });

  it('should detect token keys', () => {
    expect(isSensitiveKey('token')).toBe(true);
    expect(isSensitiveKey('accessToken')).toBe(true);
    expect(isSensitiveKey('refresh_token')).toBe(true);
  });

  it('should detect API key variations', () => {
    expect(isSensitiveKey('apiKey')).toBe(true);
    expect(isSensitiveKey('api_key')).toBe(true);
    expect(isSensitiveKey('API_KEY')).toBe(true);
  });

  it('should detect email', () => {
    expect(isSensitiveKey('email')).toBe(true);
    expect(isSensitiveKey('userEmail')).toBe(true);
  });

  it('should not flag non-sensitive keys', () => {
    expect(isSensitiveKey('username')).toBe(false);
    expect(isSensitiveKey('patternId')).toBe(false);
    expect(isSensitiveKey('exerciseType')).toBe(false);
  });
});

describe('sanitizeErrorData', () => {
  it('should redact sensitive keys', () => {
    const data = {
      username: 'john',
      password: 'secret123',
      email: 'john@example.com',
    };

    const sanitized = sanitizeErrorData(data);

    expect(sanitized.username).toBe('john');
    expect(sanitized.password).toBe('[REDACTED]');
    expect(sanitized.email).toBe('[REDACTED]');
  });

  it('should recursively sanitize nested objects', () => {
    const data = {
      user: {
        name: 'john',
        credentials: {
          password: 'secret',
          token: 'abc123',
        },
      },
    };

    const sanitized = sanitizeErrorData(data);
    const user = sanitized.user as Record<string, unknown>;
    const credentials = user.credentials as Record<string, unknown>;

    expect(user.name).toBe('john');
    expect(credentials.password).toBe('[REDACTED]');
    expect(credentials.token).toBe('[REDACTED]');
  });

  it('should preserve non-sensitive data', () => {
    const data = {
      patternId: 'reduction-wanna',
      exerciseType: 'dictation',
      score: 85,
    };

    const sanitized = sanitizeErrorData(data);

    expect(sanitized.patternId).toBe('reduction-wanna');
    expect(sanitized.exerciseType).toBe('dictation');
    expect(sanitized.score).toBe(85);
  });

  it('should handle arrays', () => {
    const data = {
      items: [1, 2, 3],
      password: 'secret',
    };

    const sanitized = sanitizeErrorData(data);

    expect(sanitized.items).toEqual([1, 2, 3]);
    expect(sanitized.password).toBe('[REDACTED]');
  });
});

describe('enrichErrorContext', () => {
  it('should extract message from error', () => {
    const result = enrichErrorContext(new Error('Test error'), {});
    expect(result.message).toBe('Test error');
  });

  it('should sanitize context', () => {
    const result = enrichErrorContext(new Error('Error'), {
      userId: 'user-123',
      password: 'secret',
    });

    expect(result.context.userId).toBe('user-123');
    expect(result.context.password).toBe('[REDACTED]');
  });

  it('should create tags from context', () => {
    const result = enrichErrorContext(new Error('Error'), {
      exerciseType: 'dictation',
      patternId: 'reduction-wanna',
    });

    expect(result.tags.exerciseType).toBe('dictation');
    expect(result.tags.patternId).toBe('reduction-wanna');
  });

  it('should handle empty context', () => {
    const result = enrichErrorContext(new Error('Error'), {});
    expect(result.tags).toEqual({});
    expect(result.context).toEqual({});
  });
});

describe('getErrorFingerprint', () => {
  it('should include error type', () => {
    const fingerprint = getErrorFingerprint(new TypeError('test'));
    expect(fingerprint[0]).toBe('TypeError');
  });

  it('should normalize numbers in message', () => {
    const fingerprint = getErrorFingerprint(new Error('Error at line 123'));
    expect(fingerprint[1]).toContain('N');
    expect(fingerprint[1]).not.toContain('123');
  });

  it('should normalize quoted strings', () => {
    const fingerprint = getErrorFingerprint(new Error('Cannot find "foo"'));
    expect(fingerprint[1]).toContain('STRING');
    expect(fingerprint[1]).not.toContain('foo');
  });

  it('should normalize UUIDs', () => {
    const fingerprint = getErrorFingerprint(
      new Error('User abc12345-1234-1234-1234-123456789abc not found')
    );
    expect(fingerprint[1]).toContain('UUID');
  });

  it('should limit message length', () => {
    const longMessage = 'a'.repeat(200);
    const fingerprint = getErrorFingerprint(new Error(longMessage));
    expect(fingerprint[1].length).toBeLessThanOrEqual(100);
  });

  it('should return Error for generic errors', () => {
    const fingerprint = getErrorFingerprint({ message: 'test' });
    expect(fingerprint[0]).toBe('Error');
  });
});

describe('getSourceMapConfig', () => {
  it('should return correct config', () => {
    const config = getSourceMapConfig('my-org', 'my-project');

    expect(config.org).toBe('my-org');
    expect(config.project).toBe('my-project');
    expect(config.urlPrefix).toBe(SOURCE_MAP_URL_PREFIX);
    expect(config.include).toContain('.next/static/chunks');
    expect(config.ignore).toContain('node_modules');
  });
});

describe('isValidDsn', () => {
  it('should return true for valid DSN', () => {
    expect(isValidDsn('https://abc123@sentry.io/456')).toBe(true);
    expect(isValidDsn('https://abc123@o123.ingest.sentry.io/456')).toBe(true);
  });

  it('should return false for invalid DSN', () => {
    expect(isValidDsn('')).toBe(false);
    expect(isValidDsn('invalid')).toBe(false);
    expect(isValidDsn('http://key@sentry.io/123')).toBe(false); // Must be https
  });

  it('should return false for null/undefined', () => {
    expect(isValidDsn(null as unknown as string)).toBe(false);
    expect(isValidDsn(undefined as unknown as string)).toBe(false);
  });
});

describe('getEnvironmentName', () => {
  it('should return production for production', () => {
    expect(getEnvironmentName('production')).toBe('production');
  });

  it('should return test for test', () => {
    expect(getEnvironmentName('test')).toBe('test');
  });

  it('should return development for development', () => {
    expect(getEnvironmentName('development')).toBe('development');
  });

  it('should return development for unknown', () => {
    expect(getEnvironmentName('staging')).toBe('development');
    expect(getEnvironmentName('')).toBe('development');
  });

  it('should return development for undefined', () => {
    expect(getEnvironmentName()).toBe('development');
    expect(getEnvironmentName(undefined)).toBe('development');
  });
});

describe('buildReleaseString', () => {
  it('should return undefined without version', () => {
    expect(buildReleaseString()).toBeUndefined();
    expect(buildReleaseString('')).toBeUndefined();
  });

  it('should return version only without git commit', () => {
    expect(buildReleaseString('1.0.0')).toBe('1.0.0');
  });

  it('should combine version and short commit', () => {
    expect(buildReleaseString('1.0.0', 'abc1234567890')).toBe('1.0.0-abc1234');
  });

  it('should handle short commit hashes', () => {
    expect(buildReleaseString('1.0.0', 'abc')).toBe('1.0.0-abc');
  });
});

describe('Integration', () => {
  it('should handle complete error processing flow', () => {
    const error = new Error('User abc12345-1234-1234-1234-123456789abc failed to load pattern 123');
    const context = {
      userId: 'user-123',
      password: 'secret',
      patternId: 'reduction-wanna',
      exerciseType: 'dictation',
    };

    // Step 1: Check if error should be captured
    expect(shouldCaptureError(error)).toBe(true);

    // Step 2: Enrich context
    const enriched = enrichErrorContext(error, context);
    expect(enriched.context.password).toBe('[REDACTED]');
    expect(enriched.tags.patternId).toBe('reduction-wanna');

    // Step 3: Generate fingerprint
    const fingerprint = getErrorFingerprint(error);
    expect(fingerprint[0]).toBe('Error');
    expect(fingerprint[1]).toContain('UUID');
    expect(fingerprint[1]).toContain('N');
  });

  it('should correctly filter ignored errors', () => {
    const errors = [
      new Error('chrome-extension://abc/script.js'),
      new Error('Failed to fetch'),
      new Error('Loading chunk 5 failed'),
      new Error('Actual application error'),
    ];

    const captured = errors.filter(shouldCaptureError);
    expect(captured).toHaveLength(1);
    expect(captured[0].message).toBe('Actual application error');
  });
});
