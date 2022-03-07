import type Redis from 'ioredis';

/**
 * This interface describes the object that we use to store the data
 * returned from Redis about the current state of a token rate limiting bucket.
 *
 * It is instantiated for each instance of a bucket, after we have read
 * the data from Redis.
 *
 * The bucket contents store how many tokens remain in the bucket
 * and the maximum time a bucket can exist before Redis deletes it.
 * It also stores the time left until the bucket expires.
 *
 * This data provides all of the information needed to calculate
 * if a client should be rate limited; and how many tokens to
 * add back to their bucket since their last request.
 */
export interface ParsedRateLimitBucket {
  // The key associated with the bucket in Redis.
  redisKey: string;

  // The number of tokens left in the bucket and time until expiry.
  // This is stored in Redis as a JSON encoded object.
  tokenData?: RateLimitBucketContents;

  // The time left in ms before the bucket contents are deleted.
  // This is stored and managed by Redis.
  timeLeftUntilExpiry?: number;
}

/**
 * A description of the JSON record that we store in Redis for each bucket.
 * This record keeps track of how many tokens remain in the bucket and
 * the maximum time in milliseconds before they are deleted.
 */
export interface RateLimitBucketContents {
  // The number of tokens left in the bucket.
  tokens: number;

  // The maximum time in seconds after creation before the bucket records are deleted.
  maximumTimeBeforeExpiry: number;
}

export interface ParsedRateLimitBuckets {
  accessToken: ParsedRateLimitBucket | undefined;
  oktaIdentifier: ParsedRateLimitBucket | undefined;
  email: ParsedRateLimitBucket | undefined;
  ip: ParsedRateLimitBucket | undefined;
  global: ParsedRateLimitBucket;
}

export interface RateLimit {
  name: string;
  redisClient: Redis.Redis;
  bucketConfiguration: RateLimitBucketsConfiguration;
  bucketValues?: BucketValues;
}

/**
 * All of the available bucket types that can be passed to
 * an instance of the rate limiter. Every rate limiter requires a
 * global bucket definition, but the other buckets are optional.
 */
export interface RateLimitBucketsConfiguration {
  globalBucket: BucketConfiguration;
  accessTokenBucket?: BucketConfiguration;
  ipBucket?: BucketConfiguration;
  emailBucket?: BucketConfiguration;
  oktaIdentifierBucket?: BucketConfiguration;
}

export type BucketType =
  | 'email'
  | 'global'
  | 'ip'
  | 'accessToken'
  | 'oktaIdentifier';

export interface BucketConfiguration {
  capacity: number;
  addTokenMs: number;
  maximumTimeBeforeTokenExpiry?: number;
}

export interface BucketValues {
  ip?: string;
  email?: string;
  accessToken?: string;
  oktaIdentifier?: string;
}

export interface BucketKeys {
  accessTokenKey?: string;
  oktaIdentifierKey?: string;
  emailKey?: string;
  ipKey?: string;
  globalKey: string;
}

export type PipelinedBucketData = {
  redisKey: string;
  tokenData: Promise<RedisTokenDataPromise>;
  timeLeftUntilExpiry: Promise<RedisTimeUntilExpiryPromise>;
};

type RedisTokenDataPromise = {
  error: Error | null;
  data: string | null;
};

type RedisTimeUntilExpiryPromise = {
  error: Error | null;
  data: number | null;
};
