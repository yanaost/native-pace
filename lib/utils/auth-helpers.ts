/**
 * Auth Helpers
 *
 * Pure utility functions for authentication validation and error handling.
 */

/**
 * Minimum password length requirement
 */
export const PASSWORD_MIN_LENGTH = 8;

/**
 * Maximum password length (prevent DoS)
 */
export const PASSWORD_MAX_LENGTH = 128;

/**
 * Auth state type
 */
export type AuthState = 'unauthenticated' | 'authenticated' | 'loading';

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Password strength level
 */
export type PasswordStrength = 'weak' | 'fair' | 'strong';

/**
 * Common Supabase auth error codes
 */
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'invalid_credentials',
  EMAIL_NOT_CONFIRMED: 'email_not_confirmed',
  USER_NOT_FOUND: 'user_not_found',
  USER_ALREADY_EXISTS: 'user_already_registered',
  INVALID_EMAIL: 'invalid_email',
  WEAK_PASSWORD: 'weak_password',
  EXPIRED_TOKEN: 'expired_token',
  INVALID_TOKEN: 'invalid_token',
  TOO_MANY_REQUESTS: 'over_request_rate_limit',
  NETWORK_ERROR: 'network_error',
} as const;

/**
 * User-friendly auth error messages
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
  [AUTH_ERROR_CODES.EMAIL_NOT_CONFIRMED]: 'Please check your email to confirm your account.',
  [AUTH_ERROR_CODES.USER_NOT_FOUND]: 'No account found with this email.',
  [AUTH_ERROR_CODES.USER_ALREADY_EXISTS]: 'An account with this email already exists.',
  [AUTH_ERROR_CODES.INVALID_EMAIL]: 'Please enter a valid email address.',
  [AUTH_ERROR_CODES.WEAK_PASSWORD]: 'Password is too weak. Please use a stronger password.',
  [AUTH_ERROR_CODES.EXPIRED_TOKEN]: 'Your session has expired. Please sign in again.',
  [AUTH_ERROR_CODES.INVALID_TOKEN]: 'Invalid or expired link. Please request a new one.',
  [AUTH_ERROR_CODES.TOO_MANY_REQUESTS]: 'Too many attempts. Please wait a moment and try again.',
  [AUTH_ERROR_CODES.NETWORK_ERROR]: 'Connection error. Please check your internet and try again.',
} as const;

/**
 * Default error message for unknown errors
 */
export const DEFAULT_AUTH_ERROR_MESSAGE = 'An error occurred. Please try again.';

/**
 * Error codes that can be retried
 */
export const RETRYABLE_AUTH_ERRORS = [
  AUTH_ERROR_CODES.TOO_MANY_REQUESTS,
  AUTH_ERROR_CODES.NETWORK_ERROR,
] as const;

/**
 * Email regex pattern (RFC 5322 simplified)
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates email format.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) {
    return false;
  }

  return EMAIL_REGEX.test(trimmed);
}

/**
 * Normalizes email for comparison (lowercase, trimmed).
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }
  return email.trim().toLowerCase();
}

/**
 * Validates password against requirements.
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Password is required'] };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`Password must be less than ${PASSWORD_MAX_LENGTH} characters`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Checks if password has uppercase letters.
 */
export function hasUppercase(password: string): boolean {
  return /[A-Z]/.test(password);
}

/**
 * Checks if password has lowercase letters.
 */
export function hasLowercase(password: string): boolean {
  return /[a-z]/.test(password);
}

/**
 * Checks if password has numbers.
 */
export function hasNumber(password: string): boolean {
  return /\d/.test(password);
}

/**
 * Checks if password has special characters.
 */
export function hasSpecialChar(password: string): boolean {
  return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
}

/**
 * Calculates password strength.
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return 'weak';
  }

  let score = 0;

  // Length bonuses
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // Character type bonuses
  if (hasUppercase(password)) score++;
  if (hasLowercase(password)) score++;
  if (hasNumber(password)) score++;
  if (hasSpecialChar(password)) score++;

  if (score >= 6) {
    return 'strong';
  }
  if (score >= 4) {
    return 'fair';
  }
  return 'weak';
}

/**
 * Gets user-friendly message for auth error code.
 */
export function getAuthErrorMessage(errorCode: string | null | undefined): string {
  if (!errorCode) {
    return DEFAULT_AUTH_ERROR_MESSAGE;
  }

  const normalizedCode = errorCode.toLowerCase();

  // Check direct match
  if (AUTH_ERROR_MESSAGES[normalizedCode]) {
    return AUTH_ERROR_MESSAGES[normalizedCode];
  }

  // Check for partial matches (Supabase sometimes includes extra info)
  for (const [code, message] of Object.entries(AUTH_ERROR_MESSAGES)) {
    if (normalizedCode.includes(code)) {
      return message;
    }
  }

  return DEFAULT_AUTH_ERROR_MESSAGE;
}

/**
 * Checks if auth error is retryable.
 */
export function isAuthErrorRetryable(errorCode: string | null | undefined): boolean {
  if (!errorCode) {
    return false;
  }

  const normalizedCode = errorCode.toLowerCase();
  return (RETRYABLE_AUTH_ERRORS as readonly string[]).some(
    (code) => normalizedCode.includes(code)
  );
}

/**
 * Checks if session is expired.
 *
 * @param expiresAt - Expiration timestamp in seconds
 * @param currentTime - Current timestamp in seconds (defaults to now)
 */
export function isSessionExpired(
  expiresAt: number | null | undefined,
  currentTime: number = Math.floor(Date.now() / 1000)
): boolean {
  if (expiresAt === null || expiresAt === undefined) {
    return true;
  }
  return currentTime >= expiresAt;
}

/**
 * Gets remaining session time in seconds.
 *
 * @param expiresAt - Expiration timestamp in seconds
 * @param currentTime - Current timestamp in seconds (defaults to now)
 * @returns Remaining seconds (0 if expired)
 */
export function getSessionTimeRemaining(
  expiresAt: number | null | undefined,
  currentTime: number = Math.floor(Date.now() / 1000)
): number {
  if (expiresAt === null || expiresAt === undefined) {
    return 0;
  }
  return Math.max(0, expiresAt - currentTime);
}

/**
 * Gets initial auth state for app load.
 */
export function getInitialAuthState(): AuthState {
  return 'loading';
}

/**
 * Creates a signup validation result.
 */
export interface SignupValidation {
  isValid: boolean;
  emailError: string | null;
  passwordError: string | null;
}

/**
 * Validates signup form data.
 */
export function validateSignup(email: string, password: string): SignupValidation {
  const result: SignupValidation = {
    isValid: true,
    emailError: null,
    passwordError: null,
  };

  if (!isValidEmail(email)) {
    result.isValid = false;
    result.emailError = 'Please enter a valid email address';
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    result.isValid = false;
    result.passwordError = passwordValidation.errors[0] || 'Invalid password';
  }

  return result;
}

/**
 * Validates login form data.
 */
export function validateLogin(email: string, password: string): SignupValidation {
  const result: SignupValidation = {
    isValid: true,
    emailError: null,
    passwordError: null,
  };

  if (!isValidEmail(email)) {
    result.isValid = false;
    result.emailError = 'Please enter a valid email address';
  }

  if (!password || password.trim().length === 0) {
    result.isValid = false;
    result.passwordError = 'Password is required';
  }

  return result;
}
