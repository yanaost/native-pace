import {
  LEMON_SQUEEZY_API,
  getVariantId,
  getStoreId,
  getApiKey,
  createCheckoutPayload,
  validateCheckoutOptions,
  createCheckout,
  createCheckoutForPlan,
  type CheckoutOptions,
} from '../lemonsqueezy';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Store original env
const originalEnv = process.env;

beforeEach(() => {
  jest.clearAllMocks();
  // Reset env to clean state with test values
  process.env = {
    ...originalEnv,
    LEMON_SQUEEZY_API_KEY: 'test-api-key',
    LEMON_SQUEEZY_STORE_ID: 'test-store-id',
    LEMON_SQUEEZY_VARIANT_MONTHLY: 'variant-monthly',
    LEMON_SQUEEZY_VARIANT_YEARLY: 'variant-yearly',
    LEMON_SQUEEZY_VARIANT_LIFETIME: 'variant-lifetime',
  };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('LEMON_SQUEEZY_API', () => {
  it('should be the correct API URL', () => {
    expect(LEMON_SQUEEZY_API).toBe('https://api.lemonsqueezy.com/v1');
  });
});

describe('getVariantId', () => {
  it('should return monthly variant ID', () => {
    expect(getVariantId('monthly')).toBe('variant-monthly');
  });

  it('should return yearly variant ID', () => {
    expect(getVariantId('yearly')).toBe('variant-yearly');
  });

  it('should return lifetime variant ID', () => {
    expect(getVariantId('lifetime')).toBe('variant-lifetime');
  });

  it('should return undefined if env var not set', () => {
    delete process.env.LEMON_SQUEEZY_VARIANT_MONTHLY;
    expect(getVariantId('monthly')).toBeUndefined();
  });
});

describe('getStoreId', () => {
  it('should return store ID from env', () => {
    expect(getStoreId()).toBe('test-store-id');
  });

  it('should return undefined if not set', () => {
    delete process.env.LEMON_SQUEEZY_STORE_ID;
    expect(getStoreId()).toBeUndefined();
  });
});

describe('getApiKey', () => {
  it('should return API key from env', () => {
    expect(getApiKey()).toBe('test-api-key');
  });

  it('should return undefined if not set', () => {
    delete process.env.LEMON_SQUEEZY_API_KEY;
    expect(getApiKey()).toBeUndefined();
  });
});

describe('createCheckoutPayload', () => {
  const options: CheckoutOptions = {
    email: 'test@example.com',
    userId: 'user-123',
    variantId: 'variant-456',
  };
  const storeId = 'store-789';

  it('should create correct payload structure', () => {
    const payload = createCheckoutPayload(options, storeId);

    expect(payload.data.type).toBe('checkouts');
  });

  it('should include email in checkout_data', () => {
    const payload = createCheckoutPayload(options, storeId);

    expect(payload.data.attributes.checkout_data.email).toBe('test@example.com');
  });

  it('should include user_id in custom data', () => {
    const payload = createCheckoutPayload(options, storeId);

    expect(payload.data.attributes.checkout_data.custom.user_id).toBe('user-123');
  });

  it('should include store relationship', () => {
    const payload = createCheckoutPayload(options, storeId);

    expect(payload.data.relationships.store.data.type).toBe('stores');
    expect(payload.data.relationships.store.data.id).toBe('store-789');
  });

  it('should include variant relationship', () => {
    const payload = createCheckoutPayload(options, storeId);

    expect(payload.data.relationships.variant.data.type).toBe('variants');
    expect(payload.data.relationships.variant.data.id).toBe('variant-456');
  });
});

describe('validateCheckoutOptions', () => {
  it('should return null for valid options', () => {
    const options: CheckoutOptions = {
      email: 'test@example.com',
      userId: 'user-123',
      variantId: 'variant-456',
    };

    expect(validateCheckoutOptions(options)).toBeNull();
  });

  it('should return error for missing email', () => {
    const options = {
      email: '',
      userId: 'user-123',
      variantId: 'variant-456',
    };

    expect(validateCheckoutOptions(options)).toBe('Email is required');
  });

  it('should return error for missing userId', () => {
    const options = {
      email: 'test@example.com',
      userId: '',
      variantId: 'variant-456',
    };

    expect(validateCheckoutOptions(options)).toBe('User ID is required');
  });

  it('should return error for missing variantId', () => {
    const options = {
      email: 'test@example.com',
      userId: 'user-123',
      variantId: '',
    };

    expect(validateCheckoutOptions(options)).toBe('Variant ID is required');
  });

  it('should return error for invalid email format', () => {
    const options = {
      email: 'invalid-email',
      userId: 'user-123',
      variantId: 'variant-456',
    };

    expect(validateCheckoutOptions(options)).toBe('Invalid email format');
  });
});

describe('createCheckout', () => {
  const validOptions: CheckoutOptions = {
    email: 'test@example.com',
    userId: 'user-123',
    variantId: 'variant-456',
  };

  it('should throw error for invalid options', async () => {
    const invalidOptions = { email: '', userId: 'user-123', variantId: 'variant-456' };

    await expect(createCheckout(invalidOptions)).rejects.toThrow('Email is required');
  });

  it('should throw error if API key is missing', async () => {
    delete process.env.LEMON_SQUEEZY_API_KEY;

    await expect(createCheckout(validOptions)).rejects.toThrow(
      'Payment configuration error: Missing API key'
    );
  });

  it('should throw error if store ID is missing', async () => {
    delete process.env.LEMON_SQUEEZY_STORE_ID;

    await expect(createCheckout(validOptions)).rejects.toThrow(
      'Payment configuration error: Missing store ID'
    );
  });

  it('should call fetch with correct URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { attributes: { url: 'https://checkout.url' } } }),
    });

    await createCheckout(validOptions);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.lemonsqueezy.com/v1/checkouts',
      expect.any(Object)
    );
  });

  it('should include authorization header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { attributes: { url: 'https://checkout.url' } } }),
    });

    await createCheckout(validOptions);

    const fetchCall = mockFetch.mock.calls[0];
    expect(fetchCall[1].headers['Authorization']).toBe('Bearer test-api-key');
  });

  it('should return checkout URL on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { attributes: { url: 'https://checkout.example.com/abc123' } } }),
    });

    const url = await createCheckout(validOptions);

    expect(url).toBe('https://checkout.example.com/abc123');
  });

  it('should throw error on API failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'Bad request',
    });

    await expect(createCheckout(validOptions)).rejects.toThrow('Failed to create checkout: 400');
  });

  it('should throw error if response has no URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { attributes: {} } }),
    });

    await expect(createCheckout(validOptions)).rejects.toThrow('Invalid response: No checkout URL');
  });
});

describe('createCheckoutForPlan', () => {
  it('should throw error if variant not configured', async () => {
    delete process.env.LEMON_SQUEEZY_VARIANT_MONTHLY;

    await expect(createCheckoutForPlan('test@example.com', 'user-123', 'monthly')).rejects.toThrow(
      'No variant configured for plan type: monthly'
    );
  });

  it('should call createCheckout with correct variant', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { attributes: { url: 'https://checkout.url' } } }),
    });

    await createCheckoutForPlan('test@example.com', 'user-123', 'yearly');

    const fetchCall = mockFetch.mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.data.relationships.variant.data.id).toBe('variant-yearly');
  });

  it('should return checkout URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { attributes: { url: 'https://checkout.example.com' } } }),
    });

    const url = await createCheckoutForPlan('test@example.com', 'user-123', 'lifetime');

    expect(url).toBe('https://checkout.example.com');
  });
});
