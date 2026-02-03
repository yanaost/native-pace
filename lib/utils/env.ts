/**
 * Environment variable validation and typed access
 *
 * This module validates required environment variables at runtime
 * and provides type-safe access to all environment configuration.
 *
 * NOTE: For NEXT_PUBLIC_* variables, we must use direct property access
 * (e.g., process.env.NEXT_PUBLIC_X) because Next.js replaces these at
 * build time via string replacement. Dynamic access like process.env[name]
 * does not get replaced.
 */

function assertEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
        `Please check your .env.local file. See .env.example for reference.`
    );
  }
  return value;
}

/**
 * Public environment variables (available in browser)
 * These use the NEXT_PUBLIC_ prefix and are replaced at build time
 */
export const publicEnv = {
  /** Supabase project URL */
  get supabaseUrl(): string {
    return assertEnv(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      'NEXT_PUBLIC_SUPABASE_URL'
    );
  },

  /** Supabase anonymous/public key */
  get supabaseAnonKey(): string {
    return assertEnv(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  },

  /** Application URL for redirects and links */
  get appUrl(): string {
    return assertEnv(
      process.env.NEXT_PUBLIC_APP_URL,
      'NEXT_PUBLIC_APP_URL'
    );
  },

  /** PostHog analytics key (optional, Phase 12) */
  get posthogKey(): string | undefined {
    return process.env.NEXT_PUBLIC_POSTHOG_KEY || undefined;
  },
} as const;

/**
 * Server-only environment variables
 * These should NEVER be exposed to the browser
 *
 * Note: Access these only in server components, API routes, or server actions
 */
export const serverEnv = {
  /** Supabase service role key for admin operations (optional, Phase 1.3) */
  get supabaseServiceRoleKey(): string | undefined {
    return process.env.SUPABASE_SERVICE_ROLE_KEY || undefined;
  },

  /** Lemon Squeezy API key (optional, Phase 10) */
  get lemonSqueezyApiKey(): string | undefined {
    return process.env.LEMON_SQUEEZY_API_KEY || undefined;
  },

  /** Lemon Squeezy store ID (optional, Phase 10) */
  get lemonSqueezyStoreId(): string | undefined {
    return process.env.LEMON_SQUEEZY_STORE_ID || undefined;
  },

  /** Lemon Squeezy webhook secret (optional, Phase 10) */
  get lemonSqueezyWebhookSecret(): string | undefined {
    return process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || undefined;
  },
} as const;

/**
 * Type definitions for environment variables
 */
export type PublicEnv = typeof publicEnv;
export type ServerEnv = typeof serverEnv;
