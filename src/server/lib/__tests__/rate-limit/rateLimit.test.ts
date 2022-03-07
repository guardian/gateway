import Redis from 'ioredis-mock';
import rateLimit, { BucketConfiguration } from '@/server/lib/rate-limit';

const globalBucket: BucketConfiguration = {
  addTokenMs: 500,
  capacity: 5,
  name: 'global',
  maximumTimeBeforeTokenExpiry: 21700, // 6 hours in seconds
};

const ipBucket: BucketConfiguration = {
  addTokenMs: 500,
  capacity: 5,
  name: 'ip',
  maximumTimeBeforeTokenExpiry: 21700, // 6 hours in seconds
};

const emailBucket: BucketConfiguration = {
  addTokenMs: 500,
  capacity: 5,
  name: 'email',
  maximumTimeBeforeTokenExpiry: 21700, // 6 hours in seconds
};

const accessTokenBucket: BucketConfiguration = {
  addTokenMs: 500,
  capacity: 5,
  name: 'accessToken',
  maximumTimeBeforeTokenExpiry: 21700, // 6 hours in seconds
};

const oktaIdentifierBucket: BucketConfiguration = {
  addTokenMs: 500,
  capacity: 5,
  name: 'oktaIdentifier',
  maximumTimeBeforeTokenExpiry: 21700, // 6 hours in seconds
};

// Integration testing rate limiting with Redis

describe('rateLimit', () => {
  afterEach((done) => {
    // in-memory redis store is persisted after each run
    // make sure to clear the store after each test
    new Redis().flushall().then(() => done());
  });

  it('should rate limit when the global rate bucket capacity is reached and refill the bucket after configured timeout', async () => {
    const redisClient = new Redis();
    const applyGlobalRateLimit = async () =>
      await rateLimit({
        name: '/signin',
        redisClient,
        bucketConfiguration: {
          globalBucket,
        },
      });

    // Rate limit five times.
    for (let i = 0; i < 5; i++) {
      const isRateLimited = await applyGlobalRateLimit();
      expect(isRateLimited).toBeFalsy();
    }

    // We should be rate limited on the sixth call.
    const shouldBeRateLimited = await applyGlobalRateLimit();
    expect(shouldBeRateLimited).toBeTruthy();

    // Wait 500ms for a token to be added back to the bucket.
    await new Promise((r) => setTimeout(r, globalBucket.addTokenMs));

    // We should have a token after the timeout.
    const isRateLimited = await applyGlobalRateLimit();
    expect(isRateLimited).toBeFalsy();
  });

  it('should rate limit when the ip rate bucket capacity is reached', async () => {
    const redisClient = new Redis();
    const applyIpRateLimit = async () =>
      await rateLimit({
        name: '/signin',
        redisClient,
        bucketConfiguration: {
          ipBucket,
          globalBucket: { ...globalBucket, capacity: 100 },
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
    expect(shouldBeRateLimited).toBeTruthy();

    // Wait 500ms for a token to be added back to the bucket.
    await new Promise((r) => setTimeout(r, globalBucket.addTokenMs));

    // We should have a token after the timeout.
    const isRateLimited = await applyIpRateLimit();
    expect(isRateLimited).toBeFalsy();
  });

  it('should rate limit when the email rate bucket capacity is reached', async () => {
    const redisClient = new Redis();
    const applyIpRateLimit = async () =>
      await rateLimit({
        name: '/signin',
        redisClient,
        bucketConfiguration: {
          emailBucket,
          globalBucket: { ...globalBucket, capacity: 100 },
        },
        bucketValues: {
          email: 'john@smith.com',
        },
      });

    // Rate limit five times.
    for (let i = 0; i < 5; i++) {
      const isRateLimited = await applyIpRateLimit();
      expect(isRateLimited).toBeFalsy();
    }

    // We should be rate limited on the sixth call.
    const shouldBeRateLimited = await applyIpRateLimit();
    expect(shouldBeRateLimited).toBeTruthy();

    // Wait 500ms for a token to be added back to the bucket.
    await new Promise((r) => setTimeout(r, globalBucket.addTokenMs));

    // We should have a token after the timeout.
    const isRateLimited = await applyIpRateLimit();
    expect(isRateLimited).toBeFalsy();
  });

  it('should rate limit when the access token rate bucket capacity is reached', async () => {
    const redisClient = new Redis();
    const applyIpRateLimit = async () =>
      await rateLimit({
        name: '/signin',
        redisClient,
        bucketConfiguration: {
          accessTokenBucket,
          globalBucket: { ...globalBucket, capacity: 100 },
        },
        bucketValues: {
          accessToken: 'access-token-example',
        },
      });

    // Rate limit five times.
    for (let i = 0; i < 5; i++) {
      const isRateLimited = await applyIpRateLimit();
      expect(isRateLimited).toBeFalsy();
    }

    // We should be rate limited on the sixth call.
    const shouldBeRateLimited = await applyIpRateLimit();
    expect(shouldBeRateLimited).toBeTruthy();

    // Wait 500ms for a token to be added back to the bucket.
    await new Promise((r) => setTimeout(r, globalBucket.addTokenMs));

    // We should have a token after the timeout.
    const isRateLimited = await applyIpRateLimit();
    expect(isRateLimited).toBeFalsy();
  });

  it('should rate limit when the okta id token rate bucket capacity is reached', async () => {
    const redisClient = new Redis();
    const applyIpRateLimit = async () =>
      await rateLimit({
        name: '/signin',
        redisClient,
        bucketConfiguration: {
          oktaIdentifierBucket,
          globalBucket: { ...globalBucket, capacity: 100 },
        },
        bucketValues: {
          oktaIdentifier: 'access-token-example',
        },
      });

    // Rate limit five times.
    for (let i = 0; i < 5; i++) {
      const isRateLimited = await applyIpRateLimit();
      expect(isRateLimited).toBeFalsy();
    }

    // We should be rate limited on the sixth call.
    const shouldBeRateLimited = await applyIpRateLimit();
    expect(shouldBeRateLimited).toBeTruthy();

    // Wait 500ms for a token to be added back to the bucket.
    await new Promise((r) => setTimeout(r, globalBucket.addTokenMs));

    // We should have a token after the timeout.
    const isRateLimited = await applyIpRateLimit();
    expect(isRateLimited).toBeFalsy();
  });

  it('should rate limit when the global rate limit bucket capacity is reached and recover tokens up to the maximum limit', async () => {
    const redisClient = new Redis();
    const applyIpRateLimit = async () =>
      await rateLimit({
        name: '/signin',
        redisClient,
        bucketConfiguration: {
          globalBucket: { ...globalBucket, capacity: 2, addTokenMs: 50 },
        },
        bucketValues: {
          oktaIdentifier: 'access-token-example',
        },
      });

    // Consume all of the available tokens.
    for (let i = 0; i < 2; i++) {
      const isRateLimited = await applyIpRateLimit();
      expect(isRateLimited).toBeFalsy();
    }

    // We should be rate limited on the third call.
    const shouldBeRateLimited = await applyIpRateLimit();
    expect(shouldBeRateLimited).toBeTruthy();

    // Wait 500ms for all the tokens to be restored.
    await new Promise((r) => setTimeout(r, 500));

    // Consume all of the newly added tokens.
    for (let i = 0; i < 2; i++) {
      const isRateLimited = await applyIpRateLimit();
      expect(isRateLimited).toBeFalsy();
    }

    // We should be rate limited again on the third call.
    const shouldBeRateLimitedAfterNewTokensConsumed = await applyIpRateLimit();
    expect(shouldBeRateLimitedAfterNewTokensConsumed).toBeTruthy();
  });

  // it('should not rate limit higher precedence buckets when limited by a more local bucket', async () => {

  // });
});
