/**
 * Error Handling Helpers
 *
 * Utilities for error categorization, user-friendly messages,
 * and API failure handling.
 */

/**
 * Error category types
 */
export type ErrorCategory =
  | 'network'
  | 'auth'
  | 'validation'
  | 'not-found'
  | 'server'
  | 'client'
  | 'unknown';

/**
 * Standardized application error
 */
export interface AppError {
  category: ErrorCategory;
  message: string;
  userMessage: string;
  statusCode?: number;
  originalError?: unknown;
  retryable: boolean;
}

/**
 * User-friendly error messages for each category
 */
export const ERROR_MESSAGES: Record<ErrorCategory, string> = {
  network: 'Unable to connect. Please check your internet connection and try again.',
  auth: 'Please sign in to continue.',
  validation: 'Please check your input and try again.',
  'not-found': 'The requested content could not be found.',
  server: 'Something went wrong on our end. Please try again later.',
  client: 'Something went wrong. Please refresh the page and try again.',
  unknown: 'An unexpected error occurred. Please try again.',
} as const;

/**
 * Map HTTP status codes to error categories
 */
export const HTTP_STATUS_CATEGORIES: Record<number, ErrorCategory> = {
  400: 'validation',
  401: 'auth',
  403: 'auth',
  404: 'not-found',
  408: 'network',
  422: 'validation',
  429: 'server',
  500: 'server',
  502: 'server',
  503: 'server',
  504: 'network',
} as const;

/**
 * HTTP status codes that should trigger a retry
 */
export const RETRY_STATUSES = [408, 429, 500, 502, 503, 504] as const;

/**
 * Base delay for exponential backoff in milliseconds
 */
export const BASE_RETRY_DELAY_MS = 1000;

/**
 * Maximum retry delay in milliseconds
 */
export const MAX_RETRY_DELAY_MS = 30000;

/**
 * Maximum number of retry attempts
 */
export const MAX_RETRY_ATTEMPTS = 3;

/**
 * Categorize an error by HTTP status code
 */
export function categorizeHttpError(statusCode: number): ErrorCategory {
  if (HTTP_STATUS_CATEGORIES[statusCode]) {
    return HTTP_STATUS_CATEGORIES[statusCode];
  }

  if (statusCode >= 400 && statusCode < 500) {
    return 'client';
  }

  if (statusCode >= 500) {
    return 'server';
  }

  return 'unknown';
}

/**
 * Get a user-friendly message for an error category
 */
export function getUserFriendlyMessage(category: ErrorCategory): string {
  return ERROR_MESSAGES[category];
}

/**
 * Check if an HTTP status code should trigger a retry
 */
export function isRetryableStatus(statusCode: number): boolean {
  return (RETRY_STATUSES as readonly number[]).includes(statusCode);
}

/**
 * Check if an error is retryable based on its properties
 */
export function isRetryableError(error: unknown): boolean {
  if (isNetworkError(error)) {
    return true;
  }

  const statusCode = getStatusCode(error);
  if (statusCode !== undefined) {
    return isRetryableStatus(statusCode);
  }

  return false;
}

/**
 * Extract status code from an error object
 */
export function getStatusCode(error: unknown): number | undefined {
  if (error === null || error === undefined) {
    return undefined;
  }

  if (typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;

    if (typeof errorObj.status === 'number') {
      return errorObj.status;
    }

    if (typeof errorObj.statusCode === 'number') {
      return errorObj.statusCode;
    }

    if (
      typeof errorObj.response === 'object' &&
      errorObj.response !== null
    ) {
      const response = errorObj.response as Record<string, unknown>;
      if (typeof response.status === 'number') {
        return response.status;
      }
    }
  }

  return undefined;
}

/**
 * Extract error message from any error type
 */
export function getErrorMessage(error: unknown): string {
  if (error === null || error === undefined) {
    return 'Unknown error';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;

    if (typeof errorObj.message === 'string') {
      return errorObj.message;
    }

    if (typeof errorObj.error === 'string') {
      return errorObj.error;
    }
  }

  return 'Unknown error';
}

/**
 * Check if an error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  if (error === null || error === undefined) {
    return false;
  }

  if (error instanceof TypeError) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('failed to fetch')
    );
  }

  if (typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;

    if (typeof errorObj.name === 'string') {
      const name = errorObj.name.toLowerCase();
      if (name === 'networkerror' || name === 'aborterror') {
        return true;
      }
    }

    if (typeof errorObj.code === 'string') {
      const code = errorObj.code.toUpperCase();
      if (
        code === 'ECONNREFUSED' ||
        code === 'ENOTFOUND' ||
        code === 'ETIMEDOUT' ||
        code === 'ECONNRESET'
      ) {
        return true;
      }
    }

    const statusCode = getStatusCode(error);
    if (statusCode === 408 || statusCode === 504) {
      return true;
    }
  }

  return false;
}

/**
 * Check if an error is authentication-related
 */
export function isAuthError(error: unknown): boolean {
  const statusCode = getStatusCode(error);

  if (statusCode === 401 || statusCode === 403) {
    return true;
  }

  if (error === null || error === undefined) {
    return false;
  }

  if (typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;

    if (typeof errorObj.code === 'string') {
      const code = errorObj.code.toLowerCase();
      if (
        code.includes('auth') ||
        code.includes('unauthorized') ||
        code.includes('forbidden')
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Calculate exponential backoff delay for retry attempts
 */
export function getRetryDelay(attempt: number): number {
  if (attempt < 0) {
    return BASE_RETRY_DELAY_MS;
  }

  const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
  return Math.min(delay, MAX_RETRY_DELAY_MS);
}

/**
 * Check if more retry attempts should be made
 */
export function shouldRetry(attempt: number, error: unknown): boolean {
  if (attempt >= MAX_RETRY_ATTEMPTS) {
    return false;
  }

  return isRetryableError(error);
}

/**
 * Create a standardized AppError from any error
 */
export function createAppError(
  error: unknown,
  context?: string
): AppError {
  const message = getErrorMessage(error);
  const statusCode = getStatusCode(error);

  let category: ErrorCategory;
  if (isNetworkError(error)) {
    category = 'network';
  } else if (isAuthError(error)) {
    category = 'auth';
  } else if (statusCode !== undefined) {
    category = categorizeHttpError(statusCode);
  } else {
    category = 'unknown';
  }

  const userMessage = getUserFriendlyMessage(category);
  const retryable = isRetryableError(error);

  const fullMessage = context ? `${context}: ${message}` : message;

  return {
    category,
    message: fullMessage,
    userMessage,
    statusCode,
    originalError: error,
    retryable,
  };
}

/**
 * Format error for logging (safe, no sensitive data)
 */
export function formatErrorForLog(error: AppError): Record<string, unknown> {
  return {
    category: error.category,
    message: error.message,
    statusCode: error.statusCode,
    retryable: error.retryable,
  };
}
