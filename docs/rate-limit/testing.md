## Testing

Tests for the core `rateLimit` method are defined in [rateLimit.test.ts](src/server/lib/__tests__/rate-limit/rateLimit.test.ts). These check that the order of precedence for bucket resolution is applied as expected. They also check the core token-bucket algorithm functionality as well as each bucket individually.

The Express rate limiting middleware layer is tested using the [Supertest](https://github.com/visionmedia/supertest) http server testing library. The tests defined in: [rateLimitMiddleware.test.ts](src/server/lib/__tests__/rate-limit/rateLimitMiddleware.test.ts) make assertions against rate-limited endpoints served from an instance of the express server.

An in-memory instance of Redis called [ioredis-mock](https://github.com/stipsan/ioredis-mock#readme) is used to back both of these test suites.

A Redis instance and rate limiter configuration is made available in our GitHub actions for our Cypress end-to-end and mocked test suites. This is so that we can run our tests in an environment that is as similar to production as possible. A test is also included to check that the access token rate limiting bucket is working as expected once the user is signed in: `hitsAccessTokenRateLimitAndRecoversTokenAfterTimeout`
