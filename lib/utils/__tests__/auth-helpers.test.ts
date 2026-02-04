import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  AUTH_ERROR_CODES,
  AUTH_ERROR_MESSAGES,
  DEFAULT_AUTH_ERROR_MESSAGE,
  RETRYABLE_AUTH_ERRORS,
  isValidEmail,
  normalizeEmail,
  validatePassword,
  hasUppercase,
  hasLowercase,
  hasNumber,
  hasSpecialChar,
  getPasswordStrength,
  getAuthErrorMessage,
  isAuthErrorRetryable,
  isSessionExpired,
  getSessionTimeRemaining,
  getInitialAuthState,
  validateSignup,
  validateLogin,
} from '../auth-helpers';

describe('Password Constants', () => {
  it('should have PASSWORD_MIN_LENGTH at 8', () => {
    expect(PASSWORD_MIN_LENGTH).toBe(8);
  });

  it('should have PASSWORD_MAX_LENGTH at 128', () => {
    expect(PASSWORD_MAX_LENGTH).toBe(128);
  });
});

describe('AUTH_ERROR_CODES', () => {
  it('should have invalid_credentials', () => {
    expect(AUTH_ERROR_CODES.INVALID_CREDENTIALS).toBe('invalid_credentials');
  });

  it('should have email_not_confirmed', () => {
    expect(AUTH_ERROR_CODES.EMAIL_NOT_CONFIRMED).toBe('email_not_confirmed');
  });

  it('should have user_already_registered', () => {
    expect(AUTH_ERROR_CODES.USER_ALREADY_EXISTS).toBe('user_already_registered');
  });
});

describe('AUTH_ERROR_MESSAGES', () => {
  it('should have message for invalid credentials', () => {
    expect(AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.INVALID_CREDENTIALS]).toBeDefined();
    expect(AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.INVALID_CREDENTIALS]).toContain('Invalid');
  });

  it('should have message for all error codes', () => {
    Object.values(AUTH_ERROR_CODES).forEach((code) => {
      expect(AUTH_ERROR_MESSAGES[code]).toBeDefined();
    });
  });
});

describe('RETRYABLE_AUTH_ERRORS', () => {
  it('should include rate limit error', () => {
    expect(RETRYABLE_AUTH_ERRORS).toContain(AUTH_ERROR_CODES.TOO_MANY_REQUESTS);
  });

  it('should include network error', () => {
    expect(RETRYABLE_AUTH_ERRORS).toContain(AUTH_ERROR_CODES.NETWORK_ERROR);
  });

  it('should not include invalid credentials', () => {
    expect(RETRYABLE_AUTH_ERRORS).not.toContain(AUTH_ERROR_CODES.INVALID_CREDENTIALS);
  });
});

describe('isValidEmail', () => {
  it('should return true for valid email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.org')).toBe(true);
    expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
  });

  it('should return false for invalid email', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('no@domain')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('nodomain@.com')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('should return false for null/undefined', () => {
    expect(isValidEmail(null as unknown as string)).toBe(false);
    expect(isValidEmail(undefined as unknown as string)).toBe(false);
  });

  it('should handle whitespace', () => {
    expect(isValidEmail('  test@example.com  ')).toBe(true);
    expect(isValidEmail('   ')).toBe(false);
  });

  it('should reject very long emails', () => {
    const longEmail = 'a'.repeat(250) + '@example.com';
    expect(isValidEmail(longEmail)).toBe(false);
  });
});

describe('normalizeEmail', () => {
  it('should lowercase email', () => {
    expect(normalizeEmail('Test@Example.COM')).toBe('test@example.com');
  });

  it('should trim whitespace', () => {
    expect(normalizeEmail('  test@example.com  ')).toBe('test@example.com');
  });

  it('should return empty string for null/undefined', () => {
    expect(normalizeEmail(null as unknown as string)).toBe('');
    expect(normalizeEmail(undefined as unknown as string)).toBe('');
  });

  it('should handle empty string', () => {
    expect(normalizeEmail('')).toBe('');
  });
});

describe('validatePassword', () => {
  it('should return valid for strong password', () => {
    const result = validatePassword('StrongP@ss123');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should return valid for minimum length password', () => {
    const result = validatePassword('12345678');
    expect(result.isValid).toBe(true);
  });

  it('should return invalid for short password', () => {
    const result = validatePassword('short');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('at least');
  });

  it('should return invalid for empty password', () => {
    const result = validatePassword('');
    expect(result.isValid).toBe(false);
  });

  it('should return invalid for null/undefined', () => {
    expect(validatePassword(null as unknown as string).isValid).toBe(false);
    expect(validatePassword(undefined as unknown as string).isValid).toBe(false);
  });

  it('should return invalid for very long password', () => {
    const result = validatePassword('a'.repeat(130));
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('less than');
  });
});

describe('hasUppercase', () => {
  it('should return true when uppercase present', () => {
    expect(hasUppercase('Hello')).toBe(true);
    expect(hasUppercase('HELLO')).toBe(true);
  });

  it('should return false when no uppercase', () => {
    expect(hasUppercase('hello')).toBe(false);
    expect(hasUppercase('123')).toBe(false);
  });
});

describe('hasLowercase', () => {
  it('should return true when lowercase present', () => {
    expect(hasLowercase('Hello')).toBe(true);
    expect(hasLowercase('hello')).toBe(true);
  });

  it('should return false when no lowercase', () => {
    expect(hasLowercase('HELLO')).toBe(false);
    expect(hasLowercase('123')).toBe(false);
  });
});

describe('hasNumber', () => {
  it('should return true when number present', () => {
    expect(hasNumber('hello1')).toBe(true);
    expect(hasNumber('123')).toBe(true);
  });

  it('should return false when no number', () => {
    expect(hasNumber('hello')).toBe(false);
  });
});

describe('hasSpecialChar', () => {
  it('should return true when special char present', () => {
    expect(hasSpecialChar('hello!')).toBe(true);
    expect(hasSpecialChar('p@ssword')).toBe(true);
    expect(hasSpecialChar('test#123')).toBe(true);
  });

  it('should return false when no special char', () => {
    expect(hasSpecialChar('hello')).toBe(false);
    expect(hasSpecialChar('Hello123')).toBe(false);
  });
});

describe('getPasswordStrength', () => {
  it('should return weak for short password', () => {
    expect(getPasswordStrength('short')).toBe('weak');
  });

  it('should return weak for simple password', () => {
    expect(getPasswordStrength('password')).toBe('weak');
  });

  it('should return fair for moderate password', () => {
    expect(getPasswordStrength('Password1')).toBe('fair');
  });

  it('should return strong for complex password', () => {
    expect(getPasswordStrength('P@ssw0rd!Strong')).toBe('strong');
  });

  it('should return weak for empty password', () => {
    expect(getPasswordStrength('')).toBe('weak');
  });

  it('should return weak for null/undefined', () => {
    expect(getPasswordStrength(null as unknown as string)).toBe('weak');
    expect(getPasswordStrength(undefined as unknown as string)).toBe('weak');
  });
});

describe('getAuthErrorMessage', () => {
  it('should return message for known error code', () => {
    expect(getAuthErrorMessage('invalid_credentials')).toContain('Invalid');
  });

  it('should handle partial matches', () => {
    expect(getAuthErrorMessage('auth/invalid_credentials')).toContain('Invalid');
  });

  it('should return default for unknown error', () => {
    expect(getAuthErrorMessage('unknown_error')).toBe(DEFAULT_AUTH_ERROR_MESSAGE);
  });

  it('should return default for null/undefined', () => {
    expect(getAuthErrorMessage(null)).toBe(DEFAULT_AUTH_ERROR_MESSAGE);
    expect(getAuthErrorMessage(undefined)).toBe(DEFAULT_AUTH_ERROR_MESSAGE);
  });

  it('should be case insensitive', () => {
    expect(getAuthErrorMessage('INVALID_CREDENTIALS')).toContain('Invalid');
  });
});

describe('isAuthErrorRetryable', () => {
  it('should return true for rate limit error', () => {
    expect(isAuthErrorRetryable('over_request_rate_limit')).toBe(true);
  });

  it('should return true for network error', () => {
    expect(isAuthErrorRetryable('network_error')).toBe(true);
  });

  it('should return false for invalid credentials', () => {
    expect(isAuthErrorRetryable('invalid_credentials')).toBe(false);
  });

  it('should return false for null/undefined', () => {
    expect(isAuthErrorRetryable(null)).toBe(false);
    expect(isAuthErrorRetryable(undefined)).toBe(false);
  });

  it('should handle partial matches', () => {
    expect(isAuthErrorRetryable('auth/network_error')).toBe(true);
  });
});

describe('isSessionExpired', () => {
  const now = 1700000000; // Fixed timestamp for testing

  it('should return true for expired session', () => {
    expect(isSessionExpired(now - 100, now)).toBe(true);
  });

  it('should return false for valid session', () => {
    expect(isSessionExpired(now + 100, now)).toBe(false);
  });

  it('should return true for exact expiry time', () => {
    expect(isSessionExpired(now, now)).toBe(true);
  });

  it('should return true for null/undefined', () => {
    expect(isSessionExpired(null, now)).toBe(true);
    expect(isSessionExpired(undefined, now)).toBe(true);
  });
});

describe('getSessionTimeRemaining', () => {
  const now = 1700000000;

  it('should return remaining seconds', () => {
    expect(getSessionTimeRemaining(now + 100, now)).toBe(100);
    expect(getSessionTimeRemaining(now + 3600, now)).toBe(3600);
  });

  it('should return 0 for expired session', () => {
    expect(getSessionTimeRemaining(now - 100, now)).toBe(0);
  });

  it('should return 0 for exact expiry', () => {
    expect(getSessionTimeRemaining(now, now)).toBe(0);
  });

  it('should return 0 for null/undefined', () => {
    expect(getSessionTimeRemaining(null, now)).toBe(0);
    expect(getSessionTimeRemaining(undefined, now)).toBe(0);
  });
});

describe('getInitialAuthState', () => {
  it('should return loading', () => {
    expect(getInitialAuthState()).toBe('loading');
  });
});

describe('validateSignup', () => {
  it('should return valid for correct inputs', () => {
    const result = validateSignup('test@example.com', 'StrongP@ss123');
    expect(result.isValid).toBe(true);
    expect(result.emailError).toBeNull();
    expect(result.passwordError).toBeNull();
  });

  it('should return email error for invalid email', () => {
    const result = validateSignup('invalid', 'StrongP@ss123');
    expect(result.isValid).toBe(false);
    expect(result.emailError).not.toBeNull();
    expect(result.passwordError).toBeNull();
  });

  it('should return password error for weak password', () => {
    const result = validateSignup('test@example.com', 'short');
    expect(result.isValid).toBe(false);
    expect(result.emailError).toBeNull();
    expect(result.passwordError).not.toBeNull();
  });

  it('should return both errors for invalid inputs', () => {
    const result = validateSignup('invalid', 'short');
    expect(result.isValid).toBe(false);
    expect(result.emailError).not.toBeNull();
    expect(result.passwordError).not.toBeNull();
  });
});

describe('validateLogin', () => {
  it('should return valid for correct inputs', () => {
    const result = validateLogin('test@example.com', 'anypassword');
    expect(result.isValid).toBe(true);
    expect(result.emailError).toBeNull();
    expect(result.passwordError).toBeNull();
  });

  it('should return email error for invalid email', () => {
    const result = validateLogin('invalid', 'password');
    expect(result.isValid).toBe(false);
    expect(result.emailError).not.toBeNull();
  });

  it('should return password error for empty password', () => {
    const result = validateLogin('test@example.com', '');
    expect(result.isValid).toBe(false);
    expect(result.passwordError).not.toBeNull();
  });

  it('should return password error for whitespace-only password', () => {
    const result = validateLogin('test@example.com', '   ');
    expect(result.isValid).toBe(false);
    expect(result.passwordError).not.toBeNull();
  });

  it('should not validate password strength for login', () => {
    // Login should accept any non-empty password (server validates)
    const result = validateLogin('test@example.com', 'a');
    expect(result.isValid).toBe(true);
  });
});

describe('Signup Flow Validation', () => {
  it('should validate complete signup flow', () => {
    // Step 1: Invalid email
    let result = validateSignup('bad-email', 'Password123!');
    expect(result.isValid).toBe(false);

    // Step 2: Valid email, weak password
    result = validateSignup('user@example.com', '123');
    expect(result.isValid).toBe(false);

    // Step 3: Valid email, strong password
    result = validateSignup('user@example.com', 'SecureP@ss123');
    expect(result.isValid).toBe(true);
  });
});

describe('Login Flow Validation', () => {
  it('should validate complete login flow', () => {
    // Step 1: Invalid email
    let result = validateLogin('bad-email', 'password');
    expect(result.isValid).toBe(false);

    // Step 2: Valid email, empty password
    result = validateLogin('user@example.com', '');
    expect(result.isValid).toBe(false);

    // Step 3: Valid email, any password
    result = validateLogin('user@example.com', 'password');
    expect(result.isValid).toBe(true);
  });
});

describe('Protected Route Logic', () => {
  // Note: Protected route helpers are tested in subscription-helpers.test.ts
  // This section tests auth state integration

  it('should handle unauthenticated state', () => {
    const state = getInitialAuthState();
    expect(state).toBe('loading');
  });

  it('should validate session expiration for protected routes', () => {
    const now = Math.floor(Date.now() / 1000);
    const validSession = now + 3600; // 1 hour from now
    const expiredSession = now - 100;

    expect(isSessionExpired(validSession)).toBe(false);
    expect(isSessionExpired(expiredSession)).toBe(true);
  });
});
