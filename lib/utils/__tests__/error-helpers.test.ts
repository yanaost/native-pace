import {
  ErrorCategory,
  ERROR_MESSAGES,
  HTTP_STATUS_CATEGORIES,
  RETRY_STATUSES,
  BASE_RETRY_DELAY_MS,
  MAX_RETRY_DELAY_MS,
  MAX_RETRY_ATTEMPTS,
  categorizeHttpError,
  getUserFriendlyMessage,
  isRetryableStatus,
  isRetryableError,
  getStatusCode,
  getErrorMessage,
  isNetworkError,
  isAuthError,
  getRetryDelay,
  shouldRetry,
  createAppError,
  formatErrorForLog,
} from '../error-helpers';

describe('Error Message Constants', () => {
  it('should have messages for all error categories', () => {
    const categories: ErrorCategory[] = [
      'network',
      'auth',
      'validation',
      'not-found',
      'server',
      'client',
      'unknown',
    ];

    categories.forEach((category) => {
      expect(ERROR_MESSAGES[category]).toBeDefined();
      expect(typeof ERROR_MESSAGES[category]).toBe('string');
      expect(ERROR_MESSAGES[category].length).toBeGreaterThan(0);
    });
  });

  it('should have non-technical user-friendly messages', () => {
    expect(ERROR_MESSAGES.network).toContain('internet connection');
    expect(ERROR_MESSAGES.auth).toContain('sign in');
    expect(ERROR_MESSAGES.server).toContain('try again later');
  });
});

describe('HTTP Status Categories', () => {
  it('should categorize 400 as validation', () => {
    expect(HTTP_STATUS_CATEGORIES[400]).toBe('validation');
  });

  it('should categorize 401 and 403 as auth', () => {
    expect(HTTP_STATUS_CATEGORIES[401]).toBe('auth');
    expect(HTTP_STATUS_CATEGORIES[403]).toBe('auth');
  });

  it('should categorize 404 as not-found', () => {
    expect(HTTP_STATUS_CATEGORIES[404]).toBe('not-found');
  });

  it('should categorize 5xx as server', () => {
    expect(HTTP_STATUS_CATEGORIES[500]).toBe('server');
    expect(HTTP_STATUS_CATEGORIES[502]).toBe('server');
    expect(HTTP_STATUS_CATEGORIES[503]).toBe('server');
  });
});

describe('Retry Status Constants', () => {
  it('should include timeout statuses', () => {
    expect(RETRY_STATUSES).toContain(408);
    expect(RETRY_STATUSES).toContain(504);
  });

  it('should include rate limiting status', () => {
    expect(RETRY_STATUSES).toContain(429);
  });

  it('should include server error statuses', () => {
    expect(RETRY_STATUSES).toContain(500);
    expect(RETRY_STATUSES).toContain(502);
    expect(RETRY_STATUSES).toContain(503);
  });

  it('should not include client errors', () => {
    expect(RETRY_STATUSES).not.toContain(400);
    expect(RETRY_STATUSES).not.toContain(401);
    expect(RETRY_STATUSES).not.toContain(404);
  });
});

describe('Retry Constants', () => {
  it('should have BASE_RETRY_DELAY_MS at 1000', () => {
    expect(BASE_RETRY_DELAY_MS).toBe(1000);
  });

  it('should have MAX_RETRY_DELAY_MS at 30000', () => {
    expect(MAX_RETRY_DELAY_MS).toBe(30000);
  });

  it('should have MAX_RETRY_ATTEMPTS at 3', () => {
    expect(MAX_RETRY_ATTEMPTS).toBe(3);
  });
});

describe('categorizeHttpError', () => {
  it('should return validation for 400', () => {
    expect(categorizeHttpError(400)).toBe('validation');
  });

  it('should return auth for 401 and 403', () => {
    expect(categorizeHttpError(401)).toBe('auth');
    expect(categorizeHttpError(403)).toBe('auth');
  });

  it('should return not-found for 404', () => {
    expect(categorizeHttpError(404)).toBe('not-found');
  });

  it('should return server for 5xx', () => {
    expect(categorizeHttpError(500)).toBe('server');
    expect(categorizeHttpError(502)).toBe('server');
  });

  it('should return client for unmapped 4xx', () => {
    expect(categorizeHttpError(405)).toBe('client');
    expect(categorizeHttpError(418)).toBe('client');
  });

  it('should return server for unmapped 5xx', () => {
    expect(categorizeHttpError(501)).toBe('server');
    expect(categorizeHttpError(599)).toBe('server');
  });

  it('should return unknown for other status codes', () => {
    expect(categorizeHttpError(200)).toBe('unknown');
    expect(categorizeHttpError(301)).toBe('unknown');
  });
});

describe('getUserFriendlyMessage', () => {
  it('should return message for each category', () => {
    expect(getUserFriendlyMessage('network')).toBe(ERROR_MESSAGES.network);
    expect(getUserFriendlyMessage('auth')).toBe(ERROR_MESSAGES.auth);
    expect(getUserFriendlyMessage('validation')).toBe(ERROR_MESSAGES.validation);
    expect(getUserFriendlyMessage('not-found')).toBe(ERROR_MESSAGES['not-found']);
    expect(getUserFriendlyMessage('server')).toBe(ERROR_MESSAGES.server);
    expect(getUserFriendlyMessage('client')).toBe(ERROR_MESSAGES.client);
    expect(getUserFriendlyMessage('unknown')).toBe(ERROR_MESSAGES.unknown);
  });
});

describe('isRetryableStatus', () => {
  it('should return true for retry statuses', () => {
    expect(isRetryableStatus(408)).toBe(true);
    expect(isRetryableStatus(429)).toBe(true);
    expect(isRetryableStatus(500)).toBe(true);
    expect(isRetryableStatus(502)).toBe(true);
    expect(isRetryableStatus(503)).toBe(true);
    expect(isRetryableStatus(504)).toBe(true);
  });

  it('should return false for non-retry statuses', () => {
    expect(isRetryableStatus(200)).toBe(false);
    expect(isRetryableStatus(400)).toBe(false);
    expect(isRetryableStatus(401)).toBe(false);
    expect(isRetryableStatus(404)).toBe(false);
  });
});

describe('getStatusCode', () => {
  it('should return undefined for null/undefined', () => {
    expect(getStatusCode(null)).toBeUndefined();
    expect(getStatusCode(undefined)).toBeUndefined();
  });

  it('should extract status from error.status', () => {
    expect(getStatusCode({ status: 404 })).toBe(404);
  });

  it('should extract status from error.statusCode', () => {
    expect(getStatusCode({ statusCode: 500 })).toBe(500);
  });

  it('should extract status from error.response.status', () => {
    expect(getStatusCode({ response: { status: 401 } })).toBe(401);
  });

  it('should return undefined for objects without status', () => {
    expect(getStatusCode({ message: 'error' })).toBeUndefined();
    expect(getStatusCode({})).toBeUndefined();
  });

  it('should return undefined for non-objects', () => {
    expect(getStatusCode('error')).toBeUndefined();
    expect(getStatusCode(123)).toBeUndefined();
  });
});

describe('getErrorMessage', () => {
  it('should return "Unknown error" for null/undefined', () => {
    expect(getErrorMessage(null)).toBe('Unknown error');
    expect(getErrorMessage(undefined)).toBe('Unknown error');
  });

  it('should return string as-is', () => {
    expect(getErrorMessage('Custom error')).toBe('Custom error');
  });

  it('should extract message from Error', () => {
    expect(getErrorMessage(new Error('Error message'))).toBe('Error message');
  });

  it('should extract message from object with message', () => {
    expect(getErrorMessage({ message: 'Object error' })).toBe('Object error');
  });

  it('should extract error from object with error', () => {
    expect(getErrorMessage({ error: 'Error string' })).toBe('Error string');
  });

  it('should return "Unknown error" for objects without message', () => {
    expect(getErrorMessage({ code: 'ERR' })).toBe('Unknown error');
  });
});

describe('isNetworkError', () => {
  it('should return false for null/undefined', () => {
    expect(isNetworkError(null)).toBe(false);
    expect(isNetworkError(undefined)).toBe(false);
  });

  it('should return true for TypeError with network message', () => {
    expect(isNetworkError(new TypeError('Failed to fetch'))).toBe(true);
    expect(isNetworkError(new TypeError('Network request failed'))).toBe(true);
  });

  it('should return false for TypeError without network message', () => {
    expect(isNetworkError(new TypeError('Cannot read property'))).toBe(false);
  });

  it('should return true for NetworkError name', () => {
    expect(isNetworkError({ name: 'NetworkError' })).toBe(true);
    expect(isNetworkError({ name: 'AbortError' })).toBe(true);
  });

  it('should return true for network error codes', () => {
    expect(isNetworkError({ code: 'ECONNREFUSED' })).toBe(true);
    expect(isNetworkError({ code: 'ENOTFOUND' })).toBe(true);
    expect(isNetworkError({ code: 'ETIMEDOUT' })).toBe(true);
    expect(isNetworkError({ code: 'ECONNRESET' })).toBe(true);
  });

  it('should return true for timeout status codes', () => {
    expect(isNetworkError({ status: 408 })).toBe(true);
    expect(isNetworkError({ status: 504 })).toBe(true);
  });

  it('should return false for other errors', () => {
    expect(isNetworkError({ status: 500 })).toBe(false);
    expect(isNetworkError({ code: 'OTHER' })).toBe(false);
  });
});

describe('isAuthError', () => {
  it('should return true for 401', () => {
    expect(isAuthError({ status: 401 })).toBe(true);
    expect(isAuthError({ statusCode: 401 })).toBe(true);
  });

  it('should return true for 403', () => {
    expect(isAuthError({ status: 403 })).toBe(true);
  });

  it('should return true for auth-related codes', () => {
    expect(isAuthError({ code: 'auth/invalid-token' })).toBe(true);
    expect(isAuthError({ code: 'UNAUTHORIZED' })).toBe(true);
    expect(isAuthError({ code: 'FORBIDDEN' })).toBe(true);
  });

  it('should return false for null/undefined', () => {
    expect(isAuthError(null)).toBe(false);
    expect(isAuthError(undefined)).toBe(false);
  });

  it('should return false for other errors', () => {
    expect(isAuthError({ status: 400 })).toBe(false);
    expect(isAuthError({ status: 500 })).toBe(false);
    expect(isAuthError({ code: 'OTHER' })).toBe(false);
  });
});

describe('getRetryDelay', () => {
  it('should return base delay for attempt 0', () => {
    expect(getRetryDelay(0)).toBe(1000);
  });

  it('should double delay for each attempt', () => {
    expect(getRetryDelay(1)).toBe(2000);
    expect(getRetryDelay(2)).toBe(4000);
    expect(getRetryDelay(3)).toBe(8000);
  });

  it('should cap at MAX_RETRY_DELAY_MS', () => {
    expect(getRetryDelay(10)).toBe(MAX_RETRY_DELAY_MS);
    expect(getRetryDelay(100)).toBe(MAX_RETRY_DELAY_MS);
  });

  it('should return base delay for negative attempts', () => {
    expect(getRetryDelay(-1)).toBe(BASE_RETRY_DELAY_MS);
  });
});

describe('isRetryableError', () => {
  it('should return true for network errors', () => {
    expect(isRetryableError(new TypeError('Failed to fetch'))).toBe(true);
    expect(isRetryableError({ code: 'ECONNREFUSED' })).toBe(true);
  });

  it('should return true for retryable status codes', () => {
    expect(isRetryableError({ status: 500 })).toBe(true);
    expect(isRetryableError({ status: 503 })).toBe(true);
  });

  it('should return false for client errors', () => {
    expect(isRetryableError({ status: 400 })).toBe(false);
    expect(isRetryableError({ status: 401 })).toBe(false);
    expect(isRetryableError({ status: 404 })).toBe(false);
  });

  it('should return false for errors without status', () => {
    expect(isRetryableError(new Error('Generic error'))).toBe(false);
    expect(isRetryableError({ message: 'error' })).toBe(false);
  });
});

describe('shouldRetry', () => {
  it('should return true for retryable errors under max attempts', () => {
    expect(shouldRetry(0, { status: 500 })).toBe(true);
    expect(shouldRetry(1, { status: 503 })).toBe(true);
    expect(shouldRetry(2, new TypeError('Failed to fetch'))).toBe(true);
  });

  it('should return false when max attempts reached', () => {
    expect(shouldRetry(3, { status: 500 })).toBe(false);
    expect(shouldRetry(4, { status: 503 })).toBe(false);
  });

  it('should return false for non-retryable errors', () => {
    expect(shouldRetry(0, { status: 400 })).toBe(false);
    expect(shouldRetry(0, { status: 404 })).toBe(false);
  });
});

describe('createAppError', () => {
  it('should create error with network category', () => {
    const error = createAppError(new TypeError('Failed to fetch'));
    expect(error.category).toBe('network');
    expect(error.retryable).toBe(true);
    expect(error.userMessage).toBe(ERROR_MESSAGES.network);
  });

  it('should create error with auth category', () => {
    const error = createAppError({ status: 401, message: 'Unauthorized' });
    expect(error.category).toBe('auth');
    expect(error.retryable).toBe(false);
    expect(error.statusCode).toBe(401);
  });

  it('should create error with server category', () => {
    const error = createAppError({ status: 500, message: 'Server error' });
    expect(error.category).toBe('server');
    expect(error.retryable).toBe(true);
    expect(error.statusCode).toBe(500);
  });

  it('should include context in message', () => {
    const error = createAppError(
      new Error('Connection failed'),
      'Loading patterns'
    );
    expect(error.message).toBe('Loading patterns: Connection failed');
  });

  it('should preserve original error', () => {
    const original = new Error('Original');
    const error = createAppError(original);
    expect(error.originalError).toBe(original);
  });

  it('should handle unknown errors', () => {
    const error = createAppError({ something: 'weird' });
    expect(error.category).toBe('unknown');
    expect(error.message).toBe('Unknown error');
  });
});

describe('formatErrorForLog', () => {
  it('should format error for logging without sensitive data', () => {
    const appError = createAppError(
      { status: 401, message: 'Invalid token xyz123' },
      'Auth check'
    );

    const formatted = formatErrorForLog(appError);

    expect(formatted.category).toBe('auth');
    expect(formatted.message).toBe('Auth check: Invalid token xyz123');
    expect(formatted.statusCode).toBe(401);
    expect(formatted.retryable).toBe(false);
    expect(formatted).not.toHaveProperty('originalError');
    expect(formatted).not.toHaveProperty('userMessage');
  });

  it('should include all expected fields', () => {
    const appError = createAppError({ status: 500 });
    const formatted = formatErrorForLog(appError);

    expect(formatted).toHaveProperty('category');
    expect(formatted).toHaveProperty('message');
    expect(formatted).toHaveProperty('statusCode');
    expect(formatted).toHaveProperty('retryable');
  });
});
