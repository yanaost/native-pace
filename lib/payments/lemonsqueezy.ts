/**
 * Lemon Squeezy Payment Integration
 *
 * Utilities for creating checkout sessions with Lemon Squeezy.
 */

import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('lemonsqueezy');

/** Lemon Squeezy API base URL */
export const LEMON_SQUEEZY_API = 'https://api.lemonsqueezy.com/v1';

/** Plan types available for purchase */
export type PlanType = 'monthly' | 'yearly' | 'lifetime';

/** Options for creating a checkout session */
export interface CheckoutOptions {
  email: string;
  userId: string;
  variantId: string;
}

/** Response from checkout creation */
export interface CheckoutResponse {
  url: string;
}

/** Lemon Squeezy API checkout payload */
export interface CheckoutPayload {
  data: {
    type: 'checkouts';
    attributes: {
      checkout_data: {
        email: string;
        custom: {
          user_id: string;
        };
      };
    };
    relationships: {
      store: {
        data: {
          type: 'stores';
          id: string;
        };
      };
      variant: {
        data: {
          type: 'variants';
          id: string;
        };
      };
    };
  };
}

/**
 * Gets the variant ID for a plan type from environment variables.
 *
 * @param planType - The plan type (monthly, yearly, lifetime)
 * @returns Variant ID or undefined if not configured
 */
export function getVariantId(planType: PlanType): string | undefined {
  switch (planType) {
    case 'monthly':
      return process.env.LEMON_SQUEEZY_VARIANT_MONTHLY;
    case 'yearly':
      return process.env.LEMON_SQUEEZY_VARIANT_YEARLY;
    case 'lifetime':
      return process.env.LEMON_SQUEEZY_VARIANT_LIFETIME;
  }
}

/**
 * Gets the store ID from environment variables.
 *
 * @returns Store ID or undefined if not configured
 */
export function getStoreId(): string | undefined {
  return process.env.LEMON_SQUEEZY_STORE_ID;
}

/**
 * Gets the API key from environment variables.
 *
 * @returns API key or undefined if not configured
 */
export function getApiKey(): string | undefined {
  return process.env.LEMON_SQUEEZY_API_KEY;
}

/**
 * Creates the checkout payload for the Lemon Squeezy API.
 *
 * @param options - Checkout options
 * @param storeId - Lemon Squeezy store ID
 * @returns Checkout payload object
 */
export function createCheckoutPayload(
  options: CheckoutOptions,
  storeId: string
): CheckoutPayload {
  return {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: {
          email: options.email,
          custom: {
            user_id: options.userId,
          },
        },
      },
      relationships: {
        store: {
          data: {
            type: 'stores',
            id: storeId,
          },
        },
        variant: {
          data: {
            type: 'variants',
            id: options.variantId,
          },
        },
      },
    },
  };
}

/**
 * Validates checkout options.
 *
 * @param options - Checkout options to validate
 * @returns Error message if invalid, null if valid
 */
export function validateCheckoutOptions(options: CheckoutOptions): string | null {
  if (!options.email) {
    return 'Email is required';
  }
  if (!options.userId) {
    return 'User ID is required';
  }
  if (!options.variantId) {
    return 'Variant ID is required';
  }
  // Basic email validation
  if (!options.email.includes('@')) {
    return 'Invalid email format';
  }
  return null;
}

/**
 * Creates a checkout session with Lemon Squeezy.
 *
 * @param options - Checkout options including email, userId, and variantId
 * @returns Checkout URL for redirecting the user
 * @throws Error if API call fails or configuration is missing
 */
export async function createCheckout(options: CheckoutOptions): Promise<string> {
  logger.info('Creating checkout session', { email: options.email, variantId: options.variantId });

  // Validate options
  const validationError = validateCheckoutOptions(options);
  if (validationError) {
    logger.error('Invalid checkout options', { error: validationError });
    throw new Error(validationError);
  }

  // Get configuration
  const apiKey = getApiKey();
  const storeId = getStoreId();

  if (!apiKey) {
    logger.error('Missing LEMON_SQUEEZY_API_KEY');
    throw new Error('Payment configuration error: Missing API key');
  }

  if (!storeId) {
    logger.error('Missing LEMON_SQUEEZY_STORE_ID');
    throw new Error('Payment configuration error: Missing store ID');
  }

  // Build payload
  const payload = createCheckoutPayload(options, storeId);

  // Make API request
  const response = await fetch(`${LEMON_SQUEEZY_API}/checkouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.api+json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Checkout creation failed', { status: response.status, error: errorText });
    throw new Error(`Failed to create checkout: ${response.status}`);
  }

  const data = await response.json();
  const checkoutUrl = data.data?.attributes?.url;

  if (!checkoutUrl) {
    logger.error('No checkout URL in response', { data });
    throw new Error('Invalid response: No checkout URL');
  }

  logger.info('Checkout session created', { url: checkoutUrl });
  return checkoutUrl;
}

/**
 * Creates a checkout session for a specific plan type.
 *
 * @param email - User's email
 * @param userId - User's ID
 * @param planType - Plan type to purchase
 * @returns Checkout URL
 * @throws Error if variant ID is not configured for the plan type
 */
export async function createCheckoutForPlan(
  email: string,
  userId: string,
  planType: PlanType
): Promise<string> {
  const variantId = getVariantId(planType);

  if (!variantId) {
    throw new Error(`No variant configured for plan type: ${planType}`);
  }

  return createCheckout({ email, userId, variantId });
}
