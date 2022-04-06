# Rate Limiter Configuration

We define the configuration as a JSON string that follows this shape:

```json
{
  "enabled": true,
  "defaultBuckets": {
    "enabled": true,
    "globalBucket": { "capacity": 500, "addTokenMs": 50 },
    "ipBucket": { "capacity": 100, "addTokenMs": 50 },
    "emailBucket": { "capacity": 100, "addTokenMs": 50 },
    "oktaIdentifierBucket": { "capacity": 100, "addTokenMs": 50 },
    "accessTokenBucket": { "capacity": 100, "addTokenMs": 50 }
  },
  "routeBuckets": {
    "/signin": { "enabled": true, "capacity": 100, "addTokenMs": 50 },
    ...any other other routes to override...
  }
}
```

## Validation

When Gateway is started, we first validate the configuration to ensure that it is in the shape we expect.

The validation process happens in validateConfiguration.ts where we validate against a strongly typed schema defined using the Zod library.

## Entry: `enabled`

A boolean value that indicates whether the rate limiter is enabled or not. If it is set to `false`, we disable all rate limiting functionality and make no attempt to connect to Redis.

If `true`, upon startup Gateway will make an attempt to connect to Redis using the `REDIS_HOST` and `REDIS_PASSWORD` environment variables provided at startup.

If the Redis connection fails, the server refuse to serve any requests until the connection has been established.

## Entry: `defaultBuckets`

The bucket entries in `defaultBuckets` are applied across all routes served by Gateway. Configuration for any specific route can be overridden by specifying its path in `routeBuckets`.

### Allowing the rate limiter on specific routes only

- Setting `enabled` to `false` will disable rate limiting by default on all routes. Rate limiting for individual routes can then be selectively enabled by setting `enabled` to `true` in the individual `routeBuckets` configuration.

- Setting `enabled` to `true` will enable rate limiting by default on all routes. Rate limiting for individual routes can then be selectively disabled by setting `enabled` to `false` in the individual `routeBuckets` configuration.

**Note:** Disabling rate limiting on a route only means that the rate limiter will not run - it does not stop the route from being accesed.

## Entry: `routeBuckets`

By default, every route in the application will be protected by the buckets defined in `defaultBuckets`.

This isn't always desired however, in some cases we would like to override those definitions for specific routes. `routeBuckets` allows us to do this by specifying a route to override and applying a custom set of buckets to it.

Rate limiting for individual routes can be enabled or disabled by setting the `enabled` property.
