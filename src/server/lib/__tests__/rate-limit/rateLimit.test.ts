import type { Redis as IORedis } from 'ioredis';
import Redis from 'ioredis-mock';
import rateLimit, { BucketValues } from '@/server/lib/rate-limit';

// mock the server side logger
jest.mock('@/server/lib/serverSideLogger');

// mocked configuration
jest.mock('@/server/lib/getConfiguration', () => ({
  getConfiguration: () => ({
    stage: 'DEV',
    aws: {},
  }),
}));

// Integration tests for rate limiting with Redis

describe('rateLimit', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach((done) => {
    // in-memory redis store is persisted after each run
    // make sure to clear the store after each test
    new Redis().flushall().then(() => done());
  });

  afterAll(() => {
    // Reset fake timers.
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should rate limit when the global rate bucket capacity is reached and refill the bucket after configured timeout', async () => {
    const applyGlobalRateLimit = async () =>
      await rateLimit({
        route: '/signin',
        redisClient: new Redis() as IORedis,
        bucketConfiguration: {
          globalBucket: { addTokenMs: 500, capacity: 5 },
        },
      });

    // Rate limit five times.
    for (let i = 0; i < 5; i++) {
      const isRateLimited = await applyGlobalRateLimit();
      expect(isRateLimited).toBeFalsy();
    }

    // We should be rate limited on the sixth call.
    const rateLimitType = await applyGlobalRateLimit();
    expect(rateLimitType).toBe('global');

    // Wait 500ms for a token to be added back to the bucket.
    jest.advanceTimersByTime(500);

    // We should have a token after the timeout.
    const isRateLimited = await applyGlobalRateLimit();
    expect(isRateLimited).toBeFalsy();
  });

  it('should rate limit when the ip rate bucket capacity is reached', async () => {
    const applyIpRateLimit = async () =>
      await rateLimit({
        route: '/signin',
        redisClient: new Redis() as IORedis,
        bucketConfiguration: {
          ipBucket: { addTokenMs: 500, capacity: 5 },
          globalBucket: { addTokenMs: 500, capacity: 100 },
        },
        bucketValues: {
          ip: '127.0.0.1',
        },
      });

    // Rate limit five times.
    for (let i = 0; i < 5; i++) {
      const isRateLimited = await applyIpRateLimit();
      expect(isRateLimited).toBeFalsy();
    }

    // We should be rate limited on the sixth call.
    const shouldBeRateLimited = await applyIpRateLimit();
    expect(shouldBeRateLimited).toBe('ip');

    // Wait 500ms for a token to be added back to the bucket.
    jest.advanceTimersByTime(500);

    // We should have a token after the timeout.
    const isRateLimited = await applyIpRateLimit();
    expect(isRateLimited).toBeFalsy();
  });

  it('should rate limit when the email rate bucket capacity is reached', async () => {
    const applyEmailRateLimit = async () =>
      await rateLimit({
        route: '/signin',
        redisClient: new Redis() as IORedis,
        bucketConfiguration: {
          emailBucket: { addTokenMs: 500, capacity: 5 },
          globalBucket: { addTokenMs: 500, capacity: 100 },
        },
        bucketValues: {
          email: 'john@smith.com',
        },
      });

    // Rate limit five times.
    for (let i = 0; i < 5; i++) {
      const isRateLimited = await applyEmailRateLimit();
      expect(isRateLimited).toBeFalsy();
    }

    // We should be rate limited on the sixth call.
    const rateLimitType = await applyEmailRateLimit();
    expect(rateLimitType).toBe('email');

    // Wait 500ms for a token to be added back to the bucket.
    jest.advanceTimersByTime(500);

    // We should have a token after the timeout.
    const isRateLimited = await applyEmailRateLimit();
    expect(isRateLimited).toBeFalsy();
  });

  it('should rate limit when the access token rate bucket capacity is reached', async () => {
    const applyIpRateLimit = async () =>
      await rateLimit({
        route: '/signin',
        redisClient: new Redis() as IORedis,
        bucketConfiguration: {
          accessTokenBucket: { addTokenMs: 500, capacity: 5 },
          globalBucket: { addTokenMs: 500, capacity: 100 },
        },
        bucketValues: {
          accessToken: 'access-token',
        },
      });

    // Rate limit five times.
    for (let i = 0; i < 5; i++) {
      const isRateLimited = await applyIpRateLimit();
      expect(isRateLimited).toBeFalsy();
    }

    // We should be rate limited on the sixth call.
    const rateLimitType = await applyIpRateLimit();
    expect(rateLimitType).toBe('accessToken');

    // Wait 500ms for a token to be added back to the bucket.
    jest.advanceTimersByTime(500);

    // We should have a token after the timeout.
    const isRateLimited = await applyIpRateLimit();
    expect(isRateLimited).toBeFalsy();
  });

  it('should rate limit when the okta id token rate bucket capacity is reached', async () => {
    const applyOktaRateLimit = async () =>
      await rateLimit({
        route: '/signin',
        redisClient: new Redis() as IORedis,
        bucketConfiguration: {
          oktaIdentifierBucket: { addTokenMs: 500, capacity: 5 },
          globalBucket: { addTokenMs: 500, capacity: 100 },
        },
        bucketValues: {
          oktaIdentifier: 'okta-identifier',
        },
      });

    // Rate limit five times.
    for (let i = 0; i < 5; i++) {
      const isRateLimited = await applyOktaRateLimit();
      expect(isRateLimited).toBeFalsy();
    }

    // We should be rate limited on the sixth call.
    const rateLimitType = await applyOktaRateLimit();
    expect(rateLimitType).toBe('oktaIdentifier');

    // Wait 500ms for a token to be added back to the bucket.
    jest.advanceTimersByTime(500);

    // We should have a token after the timeout.
    const isRateLimited = await applyOktaRateLimit();
    expect(isRateLimited).toBeFalsy();
  });

  it('should rate limit when the global rate limit bucket capacity is reached and recover tokens up to the maximum limit', async () => {
    const applyIpRateLimit = async () =>
      await rateLimit({
        route: '/signin',
        redisClient: new Redis() as IORedis,
        bucketConfiguration: {
          globalBucket: { capacity: 2, addTokenMs: 50 },
        },
        bucketValues: {
          oktaIdentifier: 'access-token',
        },
      });

    // Consume all of the available tokens.
    for (let i = 0; i < 2; i++) {
      const isRateLimited = await applyIpRateLimit();
      expect(isRateLimited).toBeFalsy();
    }

    // We should be rate limited on the third call.
    const rateLimitType = await applyIpRateLimit();
    expect(rateLimitType).toBe('global');

    // Wait 500ms for all the tokens to be restored.
    jest.advanceTimersByTime(500);

    // Consume all of the newly added tokens.
    for (let i = 0; i < 2; i++) {
      const isRateLimited = await applyIpRateLimit();
      expect(isRateLimited).toBeFalsy();
    }

    // We should be rate limited again on the third call.
    const rateLimitTypeAfterNewTokensConsumed = await applyIpRateLimit();
    expect(rateLimitTypeAfterNewTokensConsumed).toBe('global');
  });

  it('should not rate limit by ip, email, okta id or access token if values are not provided', async () => {
    const applyRateLimit = async () =>
      await rateLimit({
        route: '/signin',
        redisClient: new Redis() as IORedis,
        bucketConfiguration: {
          oktaIdentifierBucket: { capacity: 5, addTokenMs: 500 },
          emailBucket: { capacity: 5, addTokenMs: 500 },
          ipBucket: { capacity: 5, addTokenMs: 500 },
          accessTokenBucket: { capacity: 5, addTokenMs: 500 },
          globalBucket: { capacity: 100, addTokenMs: 500 },
        },
      });

    for (let i = 0; i < 10; i++) {
      expect(await applyRateLimit()).toBeFalsy();
    }
  });

  it('should not rate limit by ip, email, okta id or access token if values are provided but buckets not defined', async () => {
    const applyRateLimit = async () =>
      await rateLimit({
        route: '/signin',
        redisClient: new Redis() as IORedis,
        bucketConfiguration: {
          globalBucket: { capacity: 100, addTokenMs: 500 },
        },
        bucketValues: {
          ip: '127.0.0.1',
          accessToken: 'access-token',
          email: 'test@gu.com',
          oktaIdentifier: 'okta-identifier',
        },
      });

    for (let i = 0; i < 10; i++) {
      expect(await applyRateLimit()).toBeFalsy();
    }
  });

  it('should rate limit when email limit is hit and no okta id is passed', async () => {
    const applyRateLimit = async () =>
      await rateLimit({
        route: '/signin',
        redisClient: new Redis() as IORedis,
        bucketConfiguration: {
          oktaIdentifierBucket: { capacity: 100, addTokenMs: 500 },
          emailBucket: { capacity: 5, addTokenMs: 500 },
          ipBucket: { capacity: 100, addTokenMs: 500 },
          accessTokenBucket: { capacity: 100, addTokenMs: 500 },
          globalBucket: { capacity: 100, addTokenMs: 500 },
        },
        bucketValues: {
          ip: '127.0.0.1',
          accessToken: 'access-token',
          email: 'test@gu.com',
        },
      });

    for (let i = 0; i < 5; i++) {
      expect(await applyRateLimit()).toBeFalsy();
    }

    expect(await applyRateLimit()).toBe('email');
  });

  it('should not rate limit against a disabled bucket configuration', async () => {
    const applyDisabledRateLimit = async () =>
      await rateLimit({
        route: '/signin',
        redisClient: new Redis() as IORedis,
        bucketConfiguration: {
          enabled: false,
          globalBucket: { addTokenMs: 500, capacity: 2 },
        },
      });

    // Rate limit five times.
    for (let i = 0; i < 5; i++) {
      const isRateLimited = await applyDisabledRateLimit();
      expect(isRateLimited).toBeFalsy();
    }
  });

  it('should not rate limit higher precedence buckets when limited by a more local bucket', async () => {
    const applyRateLimit = async (bucketValues?: BucketValues) =>
      await rateLimit({
        route: '/signin',
        redisClient: new Redis() as IORedis,
        // Buckets are declared in order of precedence.
        bucketConfiguration: {
          oktaIdentifierBucket: { capacity: 4, addTokenMs: 10000 },
          emailBucket: { capacity: 5, addTokenMs: 10000 },
          ipBucket: { capacity: 6, addTokenMs: 10000 },
          accessTokenBucket: { capacity: 7, addTokenMs: 10000 },
          globalBucket: { capacity: 8, addTokenMs: 10000 },
        },
        bucketValues: {
          ip: '127.0.0.1',
          email: 'test@email.com',
          accessToken: 'access-token',
          oktaIdentifier: 'okta-id',
          ...bucketValues,
        },
      });

    // Exhaust supply of okta id tokens.
    for (let i = 0; i < 4; i++) {
      expect(await applyRateLimit()).toBeFalsy();
    }

    /**
     * New bucket state (count, value):
     * ->oktaId: 0, okta-id
     *   email: 1, test@email.com
     *   ip: 2, 127.0.0.1
     *   accessToken: 3, access-token
     *   global: 4, global
     */

    // Check that oktaIdentifier rate limit is applied.
    for (let i = 0; i < 4; i++) {
      expect(await applyRateLimit()).toBe('oktaIdentifier');
    }

    // Use the last email token.
    expect(await applyRateLimit({ oktaIdentifier: 'okta-id-2' })).toBeFalsy();

    /**
     * New bucket state (count, value):
     *   oktaId: 4, okta-id-2
     * ->email: 0, test@email.com
     *   ip: 1, 127.0.0.1
     *   accessToken: 2, access-token
     *   global: 3, global
     */

    // Check that the email rate limit is applied.
    for (let i = 0; i < 3; i++) {
      expect(await applyRateLimit({ oktaIdentifier: 'okta-id-2' })).toBe(
        'email',
      );
    }

    // Use the last ip token.
    expect(
      await applyRateLimit({
        oktaIdentifier: 'okta-id-3',
        email: 'test-2@email.com',
      }),
    ).toBeFalsy();

    /**
     * New bucket state (count, value):
     *   oktaId: 4, okta-id-3
     *   email: 5, test-2@email.com
     * ->ip: 0, 127.0.0.1
     *   accessToken: 1, access-token
     *   global: 2, global
     */

    // Check that the email rate limit is applied.
    for (let i = 0; i < 3; i++) {
      expect(
        await applyRateLimit({
          email: 'test-2@email.com',
          oktaIdentifier: 'okta-id-3',
        }),
      ).toBe('ip');
    }

    // Use the last access token
    expect(
      await applyRateLimit({
        oktaIdentifier: 'okta-id-4',
        email: 'test-3@email.com',
        ip: '127.0.0.2',
      }),
    ).toBeFalsy();

    /**
     * New bucket state (count, value):
     *   oktaId: 4, okta-id-4
     *   email: 5, test-3@email.com
     *   ip: 6, 127.0.0.2
     * ->accessToken: 0, access-token
     *   global: 1, global
     */

    for (let i = 0; i < 3; i++) {
      expect(
        await applyRateLimit({
          email: 'test-3@email.com',
          oktaIdentifier: 'okta-id-4',
          ip: '127.0.0.2',
        }),
      ).toBe('accessToken');
    }

    // Use the last global token
    expect(
      await applyRateLimit({
        oktaIdentifier: 'okta-id-5',
        email: 'test-4@email.com',
        ip: '127.0.0.3',
        accessToken: 'access-token-2',
      }),
    ).toBeFalsy();

    /**
     * New bucket state (count, value):
     *   oktaId: 4, okta-id-5
     *   email: 5, test-4@email.com
     *   ip: 6, 127.0.0.3
     *   accessToken: 7, access-token-2
     * ->global: 0, global
     */

    for (let i = 0; i < 3; i++) {
      expect(
        await applyRateLimit({
          email: 'test-4@email.com',
          oktaIdentifier: 'okta-id-5',
          ip: '127.0.0.3',
          accessToken: 'access-token-2',
        }),
      ).toBe('global');
    }
  });
});
