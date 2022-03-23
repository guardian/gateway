# Rate Limiter Configuration

We define the configuration as a JSON string that follows this shape:

```json
{
  "enabled": true,
  "defaultBuckets": {
    "globalBucket": { "capacity": 500, "addTokenMs": 50 },
    "ipBucket": { "capacity": 100, "addTokenMs": 50 },
    "emailBucket": { "capacity": 100, "addTokenMs": 50 },
    "oktaIdentifierBucket": { "capacity": 100, "addTokenMs": 50 },
    "accessTokenBucket": { "capacity": 100, "addTokenMs": 50 }
  },
  "routeBuckets": {
    "/signin": { "capacity": 100, "addTokenMs": 50 },
    ... other routes...
  }
}
```

## Validation

When Gateway is started, we first validate the configuration to ensure that it is in the shape we expect.

The validation process happens in validateConfiguration.ts where we validate against a strongly typed schema defined using the Joi library.

## `enabled`

A boolean value that indicates whether the rate limiter is enabled or not. If it is set to `false`, we disable all rate limiting functionality and make no attempt to connect to Redis.

If `true`, upon startup Gateway will make an attempt to connect to Redis using the `REDIS_HOST` and `REDIS_PASSWORD` environment variables provided at startup.

If the Redis connection fails, the server refuse to serve any requests until the connection has been established.

## `defaultBuckets`

The bucket entries in `defaultBuckets` are applied across all routes served by Gateway. Any specific route can be overridden by specifying its path in `routeBuckets`.

Each bucket is an analogy for a container allows a burst capacity of requests before throttling at a defined rate. The `capacity` defines the burst rate limit and `addTokenMs` defines the rate at which the bucket is refilled.

Buckets are categorised into types. Types allow us to rate limit based on differing criteria and priority. For most users, they won't hit any rate limit, so their request will remove a token from the capacity of the buckets involved.

In practice, there can be many instances of each bucket alive in the Redis database at one time. To illustrate: for every client with a unique ip address, we create a record in Redis that instantiates a new bucket that follows the configuration defined in `ipBucket`.

Buckets are then resolved in the following priority order:

1. oktaIdentifier - Rate limits based on Okta Id
2. email - Rate limits based on email
3. ip - Rate limits based on ip
4. accessToken - Rate limits based on SC_GU_U token
5. global - Rate limits all requests to the endpoint

As the buckets are resolved, we reduce the number of tokens by one and restore any tokens that have been added since the time it was last accessed.

During the resolution phase, if any bucket has reached its rate limit we immediately stop the process and return an HTTP 429 to the user. We prevent a DOS attack from limiting the global bucket by stopping the resolution early.

## `routeBuckets`

By default, every route in the application will be protected by the buckets defined in `defaultBuckets`.

This isn't always desired however, in some cases we would like to override those definitions for specific routes. `routeBuckets` allows us to do this by specifying a route to override and applying a custom set of buckets to it.
