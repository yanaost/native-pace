/**
 * Environment variable validation and typed access
 *
 * This module validates required environment variables at runtime
 * and provides type-safe access to all environment configuration.
 */

/**
 * Validates that a required environment variable is set
 * @throws Error if the variable is missing or empty
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
        `Please check your .env.local file. See .env.example for reference.`
    );
  }
  return value;
}

/**
 * Gets an optional environment variable, returning undefined if not set
 */
function optionalEnv(name: string): string | undefined {
  return process.env[name] || undefined;
}

/**
 * Public environment variables (available in browser)
 * These use the NEXT_PUBLIC_ prefix
 */
export const publicEnv = {
  /** Supabase project URL */
  supabaseUrl: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),

  /** Supabase anonymous/public key */
  supabaseAnonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),

  /** Application URL for redirects and links */
  appUrl: requireEnv('NEXT_PUBLIC_APP_URL'),

  /** PostHog analytics key (optional, Phase 12) */
  posthogKey: optionalEnv('NEXT_PUBLIC_POSTHOG_KEY'),
} as const;

/**
 * Server-only environment variables
 * These should NEVER be exposed to the browser
 *
 * Note: Access these only in server components, API routes, or server actions
 */
export const serverEnv = {
  /** Supabase service role key for admin operations (optional, Phase 1.3) */
  supabaseServiceRoleKey: optionalEnv('SUPABASE_SERVICE_ROLE_KEY'),

  /** Lemon Squeezy API key (optional, Phase 10) */
  lemonSqueezyApiKey: optionalEnv('LEMON_SQUEEZY_API_KEY'),

  /** Lemon Squeezy store ID (optional, Phase 10) */
  lemonSqueezyStoreId: optionalEnv('LEMON_SQUEEZY_STORE_ID'),

  /** Lemon Squeezy webhook secret (optional, Phase 10) */
  lemonSqueezyWebhookSecret: optionalEnv('LEMON_SQUEEZY_WEBHOOK_SECRET'),
} as const;

/**
 * Type definitions for environment variables
 */
export type PublicEnv = typeof publicEnv;
export type ServerEnv = typeof serverEnv;
