# Token bucket algorithm

We provide a custom implementation of rate limiting based on [token bucket](https://en.wikipedia.org/wiki/Token_bucket) algorithm.

## High-level overview

A Token "bucket" of fixed capacity is defined and given an initial amount of tokens. The bucket is stored in Redis with a maximum timeout before the record removed.

Each call to the rate limiter with the same value consumes a token until all are depleted. At this point a delay kicks in, limiting the rate at which new tokens are added back to the bucket and hence the rate of requests that can be made by the user.

The number of new tokens to add back to the bucket is calculated upon each request by working out the difference between the time of the request and when the bucket was last written to.

Knowing this time delta and the rate at which new tokens are added, we can derive the amount of tokens that will have been added to the bucket since the last request.

## Buckets

```typescript
/**
 * Standardised definition of an individual bucket.
 *
 * @param {number} capacity The maximum number of tokens that can be stored in the bucket.
 * @param {number} addTokenMs The rate in milliseconds at which the bucket is refilled
 * @param {number} maximumTimeBeforeTokenExpiry The maximum duration in seconds before the bucket is removed from Redis.
 */
export interface BucketConfiguration {
  capacity: number;
  addTokenMs: number;
  maximumTimeBeforeTokenExpiry?: number;
}
```

A bucket is an analogy for a container allows a burst capacity of requests before throttling at a defined rate.

The following information is encoded as JSON and stored in Redis:

- Capacity – the maximum burst capacity for the bucket.
- addTokenMs – the time delay in milliseconds before a new token is added to the bucket.

`maximumTimeBeforeTokenExpiry` is used to set the `ttl` (time to live) of the record.

For example, given `BucketConfiguration(capacity = 100, addTokenMs = 1000)` if each request consumes a single token, then after burst of 100 requests, the limit will be one request per second.

### Bucket types

Buckets are categorised into types. Having different types of bucket allows us to rate limit based on differing criteria and priority.

For most users, they won't hit any rate limit, so their request will remove a token from the capacity of all buckets defined for that route that we can find a value for.

In practice, there can be many instances of each bucket alive in the Redis database at one time. To illustrate this point:

> For every client with a unique ip address, we create a record based on the configuration defined in `ipBucket` in Redis that instantiates a new bucket tied to that ip address.

To address these unique buckets, we follow a bucket lookup schema. This is covered in more detail below.

### Bucket lookup keys

Individual bucket lookup keys in Redis follow the scheme:

`rl-{rateLimiterName}-{bucketName}-{hashedValue}`

We use these keys to index named buckets for unique values in Redis. For example, this record: `rl-signin-email-hashedEmail` might represent a bucket that limits based on a unique email under the sign-in route in Gateway.

### Refilling buckets

This section covers the logic behind how we refill buckets over time.

When any bucket is created or modified, we call the Redis `pttl` method to determine the remaining time to live of the bucket.

This is then used to work out how many new tokens to add to the bucket since the last request was made.

If a bucket has not been created in Redis, we instantiate a new bucket and set an expiry (time to live). Each time the bucket is updated, this expiry is reset so that we always know how long it has been since the last request using `pttl`.

### Bucket precedence and resolution

Rate limit buckets are given a precedence. If a lower bucket rate limit is hit, the buckets higher in the precedence are not updated.

Buckets are resolved in the following priority order:

1. oktaIdentifier - Rate limits based on Okta Id
2. email - Rate limits based on email
3. ip - Rate limits based on ip
4. accessToken - Rate limits based on SC_GU_U token
5. global - Rate limits all requests to the endpoint

As the buckets are resolved, we reduce the number of tokens in each sequentially and restore any tokens that have been added since the time it was last accessed.

During the resolution phase, if any bucket reaches its rate limit we immediately stop the process and return an HTTP 429 to the user.

We prevent a DOS attack from limiting the global bucket by stopping the resolution as soon as a higher level bucket is hit.

# Usage

The rate limiting implementation is defined in `@/server/lib/rate-limit`.

All calls should include a name for the rate limiter,
an instance of ioredis and configurations for all of
the buckets in use. A configuration for the global
bucket must be provided.

If a value is provided in bucketValues and the corresponding
bucket is defined in bucketConfiguration, a token will be
taken from the bucket under the hash of the value. If this
leaves the bucket empty, the name of the bucket that was
limited will be returned.

Example:

```typescript
await rateLimit({
  name: '/signin',
  redisClient,
  bucketConfiguration: {
    globalBucket: { addTokenMs: 500, capacity: 5 },
    ipBucket: { addTokenMs: 500, capacity: 2 },
  },
  bucketValues: {
    ip: '127.0.0.1',
  },
});
```

If the example above is executed with the same ip two
times within 500ms the ipBucket will be empty and the
method will return false. User is not rate limited.

Because the two requests above were made successfully,
the global rate limit bucket now has three tokens left.

If a further request is made before 500ms has passed,
the rate limiter will kick in and return 'ip', indicating
that the ip bucket has been limited.

```

```
