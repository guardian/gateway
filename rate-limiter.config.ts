import { RateLimiterConfiguration } from './src/server/models/Configuration';

export default {
  defaultBuckets: {
    globalBucket: { capacity: 100, addTokenMs: 50 },
    ipBucket: { capacity: 100, addTokenMs: 50 },
    emailBucket: { capacity: 100, addTokenMs: 50 },
    oktaIdentifierBucket: { capacity: 100, addTokenMs: 50 },
    accessTokenBucket: { capacity: 100, addTokenMs: 50 },
  },
  routeBuckets: {
    signIn: {
      globalBucket: { capacity: 500, addTokenMs: 50 },
    },
    register: {
      globalBucket: { capacity: 500, addTokenMs: 50 },
    },
  },
} as RateLimiterConfiguration;
