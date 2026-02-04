/**
 * Sentry Monitoring Helpers
 *
 * Configuration and utility functions for Sentry error monitoring.
 * Pure functions that can be unit tested.
 */

/**
 * Environment variable name for Sentry DSN
 */
export const SENTRY_DSN_KEY = 'NEXT_PUBLIC_SENTRY_DSN';

/**
 * Default trace sample rate (10%)
 */
export const DEFAULT_SAMPLE_RATE = 0.1;

/**
 * Production sample rate (100% of errors, 10% of traces)
 */
export const PRODUCTION_ERROR_SAMPLE_RATE = 1.0;

/**
 * URL prefix for source maps
 */
export const SOURCE_MAP_URL_PREFIX = '~/_next';

/**
 * Environment configuration for Sentry
 */
export interface SentryEnvironment {
  dsn?: string;
  environment?: string;
  isDevelopment?: boolean;
  release?: string;
  debug?: boolean;
}

/**
 * Sentry configuration object
 */
export interface SentryConfig {
  dsn: string | undefined;
  environment: string;
  enabled: boolean;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
  debug: boolean;
  release: string | undefined;
}

/**
 * Source map upload configuration
 */
export interface SourceMapConfig {
  org: string;
  project: string;
  urlPrefix: string;
  include: string[];
  ignore: string[];
}

/**
 * Error patterns to ignore (non-actionable errors)
 */
export const IGNORED_ERROR_PATTERNS: readonly string[] = [
  // Browser extensions
  'chrome-extension://',
  'moz-extension://',
  // Network errors that are user-side
  'Network request failed',
  'Failed to fetch',
  'Load failed',
  // User cancellations
  'AbortError',
  'The operation was aborted',
  // Browser quirks
  'ResizeObserver loop',
  // Third-party scripts
  'Script error.',
] as const;

/**
 * Ignored error message patterns (regex)
 */
export const IGNORED_ERROR_REGEX: readonly RegExp[] = [
  /^Loading chunk \d+ failed/,
  /^Unexpected token/,
  /^ChunkLoadError/,
] as const;

/**
 * Sensitive data keys to sanitize
 */
export const SENSITIVE_KEYS: readonly string[] = [
  'password',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'authorization',
  'auth',
  'credential',
  'credit_card',
  'creditCard',
  'ssn',
  'email',
] as const;

/**
 * Checks if error monitoring should be enabled.
 */
export function isMonitoringEnabled(env: SentryEnvironment): boolean {
  // Must have DSN
  if (!env.dsn) {
    return false;
  }

  // Disabled in development by default
  if (env.isDevelopment && !env.debug) {
    return false;
  }

  return true;
}

/**
 * Builds Sentry configuration object.
 */
export function getSentryConfig(env: SentryEnvironment): SentryConfig {
  const enabled = isMonitoringEnabled(env);
  const isProduction = env.environment === 'production';

  return {
    dsn: env.dsn,
    environment: env.environment || 'development',
    enabled,
    tracesSampleRate: isProduction ? DEFAULT_SAMPLE_RATE : 1.0,
    replaysSessionSampleRate: isProduction ? 0.1 : 0,
    replaysOnErrorSampleRate: isProduction ? 1.0 : 0,
    debug: env.debug || false,
    release: env.release,
  };
}

/**
 * Checks if an error should be ignored.
 */
export function isIgnoredError(error: unknown): boolean {
  const message = getErrorMessage(error);

  // Check string patterns
  for (const pattern of IGNORED_ERROR_PATTERNS) {
    if (message.includes(pattern)) {
      return true;
    }
  }

  // Check regex patterns
  for (const regex of IGNORED_ERROR_REGEX) {
    if (regex.test(message)) {
      return true;
    }
  }

  return false;
}

/**
 * Determines if an error should be captured and sent to Sentry.
 */
export function shouldCaptureError(error: unknown): boolean {
  if (!error) {
    return false;
  }

  if (isIgnoredError(error)) {
    return false;
  }

  return true;
}

/**
 * Extracts error message from any error type.
 */
export function getErrorMessage(error: unknown): string {
  if (!error) {
    return '';
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
  }

  return String(error);
}

/**
 * Checks if a key is sensitive and should be sanitized.
 */
export function isSensitiveKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive.toLowerCase()));
}

/**
 * Sanitizes an object by removing sensitive data.
 */
export function sanitizeErrorData(
  data: Record<string, unknown>
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Always recurse into objects to sanitize nested sensitive data
      sanitized[key] = sanitizeErrorData(value as Record<string, unknown>);
    } else if (isSensitiveKey(key)) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Error context for enrichment
 */
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  patternId?: string;
  exerciseType?: string;
  url?: string;
  userAgent?: string;
  [key: string]: unknown;
}

/**
 * Enriches error context with additional information.
 */
export function enrichErrorContext(
  error: unknown,
  context: ErrorContext
): {
  message: string;
  context: Record<string, unknown>;
  tags: Record<string, string>;
} {
  const message = getErrorMessage(error);
  const sanitizedContext = sanitizeErrorData(context as Record<string, unknown>);

  const tags: Record<string, string> = {};

  if (context.exerciseType) {
    tags.exerciseType = context.exerciseType;
  }

  if (context.patternId) {
    tags.patternId = context.patternId;
  }

  return {
    message,
    context: sanitizedContext,
    tags,
  };
}

/**
 * Generates a fingerprint for error grouping.
 */
export function getErrorFingerprint(error: unknown): string[] {
  const message = getErrorMessage(error);

  // Extract error type if Error instance
  let errorType = 'Error';
  if (error instanceof Error) {
    errorType = error.constructor.name;
  }

  // Normalize message for grouping
  // Order matters: UUIDs must be replaced before numbers, otherwise hex digits get replaced
  const normalizedMessage = message
    .replace(/\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b/gi, 'UUID') // Replace UUIDs first
    .replace(/\d+/g, 'N') // Replace numbers
    .replace(/['"][^'"]*['"]/g, 'STRING') // Replace quoted strings
    .substring(0, 100); // Limit length

  return [errorType, normalizedMessage];
}

/**
 * Creates source map upload configuration.
 */
export function getSourceMapConfig(
  org: string,
  project: string
): SourceMapConfig {
  return {
    org,
    project,
    urlPrefix: SOURCE_MAP_URL_PREFIX,
    include: ['.next/static/chunks'],
    ignore: ['node_modules'],
  };
}

/**
 * Validates Sentry DSN format.
 */
export function isValidDsn(dsn: string): boolean {
  if (!dsn || typeof dsn !== 'string') {
    return false;
  }

  // Basic DSN format: https://<key>@<host>/<project>
  const dsnRegex = /^https:\/\/[a-f0-9]+@[^/]+\/\d+$/;
  return dsnRegex.test(dsn);
}

/**
 * Gets environment name from NODE_ENV.
 */
export function getEnvironmentName(nodeEnv?: string): string {
  if (!nodeEnv) {
    return 'development';
  }

  switch (nodeEnv) {
    case 'production':
      return 'production';
    case 'test':
      return 'test';
    default:
      return 'development';
  }
}

/**
 * Builds release string from version and git info.
 */
export function buildReleaseString(
  version?: string,
  gitCommit?: string
): string | undefined {
  if (!version) {
    return undefined;
  }

  if (gitCommit) {
    return `${version}-${gitCommit.substring(0, 7)}`;
  }

  return version;
}
