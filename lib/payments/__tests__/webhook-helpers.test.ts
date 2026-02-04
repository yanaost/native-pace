import {
  verifyWebhookSignature,
  computeSignature,
  parseWebhookEvent,
  getEventType,
  extractUserId,
  isLifetimePurchase,
  extractSubscriptionData,
  determineSubscriptionTier,
  type WebhookEvent,
} from '../webhook-helpers';

describe('computeSignature', () => {
  it('should compute HMAC-SHA256 signature', () => {
    const body = '{"test": "data"}';
    const secret = 'test-secret';

    const signature = computeSignature(body, secret);

    expect(signature).toBeDefined();
    expect(signature.length).toBe(64); // SHA256 hex is 64 chars
  });

  it('should produce different signatures for different bodies', () => {
    const secret = 'test-secret';

    const sig1 = computeSignature('body1', secret);
    const sig2 = computeSignature('body2', secret);

    expect(sig1).not.toBe(sig2);
  });

  it('should produce different signatures for different secrets', () => {
    const body = '{"test": "data"}';

    const sig1 = computeSignature(body, 'secret1');
    const sig2 = computeSignature(body, 'secret2');

    expect(sig1).not.toBe(sig2);
  });
});

describe('verifyWebhookSignature', () => {
  const body = '{"test": "data"}';
  const secret = 'test-secret';

  it('should return true for valid signature', () => {
    const signature = computeSignature(body, secret);

    expect(verifyWebhookSignature(body, signature, secret)).toBe(true);
  });

  it('should return false for invalid signature', () => {
    expect(verifyWebhookSignature(body, 'invalid-signature', secret)).toBe(false);
  });

  it('should return false for wrong secret', () => {
    const signature = computeSignature(body, secret);

    expect(verifyWebhookSignature(body, signature, 'wrong-secret')).toBe(false);
  });

  it('should return false for modified body', () => {
    const signature = computeSignature(body, secret);

    expect(verifyWebhookSignature('modified body', signature, secret)).toBe(false);
  });

  it('should return false for empty body', () => {
    expect(verifyWebhookSignature('', 'signature', secret)).toBe(false);
  });

  it('should return false for empty signature', () => {
    expect(verifyWebhookSignature(body, '', secret)).toBe(false);
  });

  it('should return false for empty secret', () => {
    expect(verifyWebhookSignature(body, 'signature', '')).toBe(false);
  });
});

describe('parseWebhookEvent', () => {
  it('should parse valid JSON', () => {
    const body = JSON.stringify({
      meta: { event_name: 'subscription_created' },
      data: { id: '123', type: 'subscriptions', attributes: {} },
    });

    const event = parseWebhookEvent(body);

    expect(event).not.toBeNull();
    expect(event?.meta.event_name).toBe('subscription_created');
  });

  it('should return null for invalid JSON', () => {
    expect(parseWebhookEvent('not json')).toBeNull();
  });

  it('should return null for missing meta.event_name', () => {
    const body = JSON.stringify({
      meta: {},
      data: { id: '123' },
    });

    expect(parseWebhookEvent(body)).toBeNull();
  });

  it('should return null for missing data', () => {
    const body = JSON.stringify({
      meta: { event_name: 'subscription_created' },
    });

    expect(parseWebhookEvent(body)).toBeNull();
  });
});

describe('getEventType', () => {
  const createEvent = (eventName: string): WebhookEvent => ({
    meta: { event_name: eventName },
    data: { id: '123', type: 'subscriptions', attributes: {} },
  });

  it('should return subscription_created', () => {
    expect(getEventType(createEvent('subscription_created'))).toBe('subscription_created');
  });

  it('should return subscription_updated', () => {
    expect(getEventType(createEvent('subscription_updated'))).toBe('subscription_updated');
  });

  it('should return subscription_cancelled', () => {
    expect(getEventType(createEvent('subscription_cancelled'))).toBe('subscription_cancelled');
  });

  it('should return order_created', () => {
    expect(getEventType(createEvent('order_created'))).toBe('order_created');
  });

  it('should return null for unknown event type', () => {
    expect(getEventType(createEvent('unknown_event'))).toBeNull();
  });
});

describe('extractUserId', () => {
  it('should extract user ID from attributes.custom_data', () => {
    const event: WebhookEvent = {
      meta: { event_name: 'subscription_created' },
      data: {
        id: '123',
        type: 'subscriptions',
        attributes: {
          custom_data: { user_id: 'user-456' },
        },
      },
    };

    expect(extractUserId(event)).toBe('user-456');
  });

  it('should extract user ID from meta.custom_data', () => {
    const event: WebhookEvent = {
      meta: {
        event_name: 'order_created',
        custom_data: { user_id: 'user-789' },
      },
      data: {
        id: '123',
        type: 'orders',
        attributes: {},
      },
    };

    expect(extractUserId(event)).toBe('user-789');
  });

  it('should prefer attributes.custom_data over meta.custom_data', () => {
    const event: WebhookEvent = {
      meta: {
        event_name: 'subscription_created',
        custom_data: { user_id: 'meta-user' },
      },
      data: {
        id: '123',
        type: 'subscriptions',
        attributes: {
          custom_data: { user_id: 'attr-user' },
        },
      },
    };

    expect(extractUserId(event)).toBe('attr-user');
  });

  it('should return null if no user ID found', () => {
    const event: WebhookEvent = {
      meta: { event_name: 'subscription_created' },
      data: {
        id: '123',
        type: 'subscriptions',
        attributes: {},
      },
    };

    expect(extractUserId(event)).toBeNull();
  });
});

describe('isLifetimePurchase', () => {
  it('should return true for lifetime variant', () => {
    const event: WebhookEvent = {
      meta: { event_name: 'order_created' },
      data: {
        id: '123',
        type: 'orders',
        attributes: {
          first_order_item: { variant_name: 'Lifetime' },
        },
      },
    };

    expect(isLifetimePurchase(event)).toBe(true);
  });

  it('should return true for lowercase lifetime', () => {
    const event: WebhookEvent = {
      meta: { event_name: 'order_created' },
      data: {
        id: '123',
        type: 'orders',
        attributes: {
          first_order_item: { variant_name: 'lifetime' },
        },
      },
    };

    expect(isLifetimePurchase(event)).toBe(true);
  });

  it('should return false for monthly variant', () => {
    const event: WebhookEvent = {
      meta: { event_name: 'order_created' },
      data: {
        id: '123',
        type: 'orders',
        attributes: {
          first_order_item: { variant_name: 'Monthly' },
        },
      },
    };

    expect(isLifetimePurchase(event)).toBe(false);
  });

  it('should return false if no variant name', () => {
    const event: WebhookEvent = {
      meta: { event_name: 'order_created' },
      data: {
        id: '123',
        type: 'orders',
        attributes: {},
      },
    };

    expect(isLifetimePurchase(event)).toBe(false);
  });
});

describe('extractSubscriptionData', () => {
  it('should extract premium subscription data', () => {
    const event: WebhookEvent = {
      meta: { event_name: 'subscription_created' },
      data: {
        id: '123',
        type: 'subscriptions',
        attributes: {
          custom_data: { user_id: 'user-123' },
          renews_at: '2024-02-01T00:00:00Z',
        },
      },
    };

    const data = extractSubscriptionData(event);

    expect(data).not.toBeNull();
    expect(data?.userId).toBe('user-123');
    expect(data?.tier).toBe('premium');
    expect(data?.expiresAt).toBe('2024-02-01T00:00:00Z');
  });

  it('should extract lifetime purchase data', () => {
    const event: WebhookEvent = {
      meta: { event_name: 'order_created' },
      data: {
        id: '123',
        type: 'orders',
        attributes: {
          custom_data: { user_id: 'user-456' },
          first_order_item: { variant_name: 'Lifetime' },
        },
      },
    };

    const data = extractSubscriptionData(event);

    expect(data).not.toBeNull();
    expect(data?.userId).toBe('user-456');
    expect(data?.tier).toBe('lifetime');
    expect(data?.expiresAt).toBeNull();
  });

  it('should return null if no user ID', () => {
    const event: WebhookEvent = {
      meta: { event_name: 'subscription_created' },
      data: {
        id: '123',
        type: 'subscriptions',
        attributes: {},
      },
    };

    expect(extractSubscriptionData(event)).toBeNull();
  });

  it('should use ends_at if renews_at not available', () => {
    const event: WebhookEvent = {
      meta: { event_name: 'subscription_cancelled' },
      data: {
        id: '123',
        type: 'subscriptions',
        attributes: {
          custom_data: { user_id: 'user-123' },
          ends_at: '2024-03-01T00:00:00Z',
        },
      },
    };

    const data = extractSubscriptionData(event);

    expect(data?.expiresAt).toBe('2024-03-01T00:00:00Z');
  });
});

describe('determineSubscriptionTier', () => {
  const createEvent = (eventName: string, variantName?: string): WebhookEvent => ({
    meta: { event_name: eventName },
    data: {
      id: '123',
      type: 'subscriptions',
      attributes: {
        first_order_item: variantName ? { variant_name: variantName } : undefined,
      },
    },
  });

  it('should return premium for subscription_created', () => {
    const event = createEvent('subscription_created');
    expect(determineSubscriptionTier('subscription_created', event)).toBe('premium');
  });

  it('should return premium for subscription_updated', () => {
    const event = createEvent('subscription_updated');
    expect(determineSubscriptionTier('subscription_updated', event)).toBe('premium');
  });

  it('should return free for subscription_cancelled', () => {
    const event = createEvent('subscription_cancelled');
    expect(determineSubscriptionTier('subscription_cancelled', event)).toBe('free');
  });

  it('should return lifetime for lifetime order', () => {
    const event = createEvent('order_created', 'Lifetime');
    expect(determineSubscriptionTier('order_created', event)).toBe('lifetime');
  });

  it('should return free for non-lifetime order', () => {
    const event = createEvent('order_created', 'Monthly');
    expect(determineSubscriptionTier('order_created', event)).toBe('free');
  });
});
