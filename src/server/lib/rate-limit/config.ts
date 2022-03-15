// import type { RateLimiterConfiguration } from '@/server/models/Configuration';

// const rateLimitConfigLoader: () => Promise<RateLimiterConfiguration> =
//   async () => {
//     try {
//       return await import('@/../ratelimiter.config.json');
//       // return require('rate-limit-config') as RateLimiterConfiguration;
//     } catch (e) {
//       console.log(
//         'There was a problem resolving the rate limiter configuration. Falling back to defaults.',
//       );
//       return {
//         enabled: false,
//         defaultBuckets: {
//           globalBucket: { capacity: 500, addTokenMs: 50 },
//           ipBucket: { capacity: 100, addTokenMs: 50 },
//           emailBucket: { capacity: 100, addTokenMs: 50 },
//           oktaIdentifierBucket: { capacity: 100, addTokenMs: 50 },
//           accessTokenBucket: { capacity: 100, addTokenMs: 50 },
//         },

//         routeBuckets: {},
//       } as RateLimiterConfiguration;
//     }
//   };

// export default rateLimitConfigLoader();
