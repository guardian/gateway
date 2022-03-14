import { RateLimiterConfiguration } from '@/server/models/Configuration';
export default (() => {
  try {
    console.log('aah');
    return require('@/../.ratelimiter.json');
  } catch {
    console.log(
      'There was a problem resolving the rate limiter configuration. Falling back to defaults.',
    );
    return {
      enabled: false,
      defaultBuckets: {
        globalBucket: { capacity: 500, addTokenMs: 50 },
        ipBucket: { capacity: 100, addTokenMs: 50 },
        emailBucket: { capacity: 100, addTokenMs: 50 },
        oktaIdentifierBucket: { capacity: 100, addTokenMs: 50 },
        accessTokenBucket: { capacity: 100, addTokenMs: 50 },
      },
      routeBuckets: {},
    };
  }
})() as RateLimiterConfiguration;
