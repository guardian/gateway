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
 *
 * @param redisKey The key associated with the bucket in Redis.
 * @param tokenData The number of tokens left in the bucket and time until expiry. This is stored in Redis as a JSON encoded object.
 * @param timeLeftUntilExpiry The time left in ms before the bucket contents are deleted. This is stored and managed by Redis and read using the pttl command.
 */
export interface ParsedRateLimitBucket {
  redisKey: string;
  tokenData?: RateLimitBucketContents;
  timeLeftUntilExpiry?: number;
}

/**
 * A description of the JSON record that we store in Redis for each bucket.
 * This record keeps track of how many tokens remain in the bucket and
 * the maximum time in milliseconds before they are deleted.
 *
 * @param tokens The number of tokens left in the bucket.
 * @param maximumTimeBeforeExpiry The maximum time in seconds after creation before the bucket records are deleted.
 */
export interface RateLimitBucketContents {
  tokens: number;
  maximumTimeBeforeExpiry: number;
}

/**
 * Represents the result of reading and subsequently parsing the buckets stored in Redis.
 */
export interface ParsedRateLimitBuckets {
  accessToken: ParsedRateLimitBucket | undefined;
  oktaIdentifier: ParsedRateLimitBucket | undefined;
  email: ParsedRateLimitBucket | undefined;
  ip: ParsedRateLimitBucket | undefined;
  global: ParsedRateLimitBucket;
}

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

/**
 * Values corresponding to the buckets configured for each bucket.
 * Global is not included because it applies for all requests.
 *
 * @param ip An ip to rate limit against.
 * @param email An email to rate limit against.
 * @param accessToken An access token to rate limit against.
 * @param oktaIdentifier An okta id to rate limit against.
 */
export interface BucketValues {
  ip?: string;
  email?: string;
  accessToken?: string;
  oktaIdentifier?: string;
}

/**
 * The type signature for the rateLimit method.
 *
 * @param name A unique name for the rate limiter. For example, the route it is protecting.
 * @param redisClient An instance of the ioredis client.
 * @param bucketConfiguration Definitions for each bucket in use by this rate limiter.
 * @param bucketValues Optional values for each bucket to deduct tokens against.
 */
export interface RateLimitParameters {
  name: string;
  redisClient: Redis.Redis;
  bucketConfiguration: RateLimitBucketsConfiguration;
  bucketValues?: BucketValues;
}

export interface BucketKeys {
  accessTokenKey?: string;
  oktaIdentifierKey?: string;
  emailKey?: string;
  ipKey?: string;
  globalKey: string;
}

/**
 * Union type representing all buckets available for rate limiting.
 */
export type BucketType =
  | 'email'
  | 'global'
  | 'ip'
  | 'accessToken'
  | 'oktaIdentifier';

/**
 * Container for two promises holding the state of the pipelined read request sent to Redis.
 */
export type PipelinedBucketData = {
  redisKey: string;
  tokenData: RedisTokenDataPromise;
  timeLeftUntilExpiry: RedisTimeUntilExpiryPromise;
};

type RedisTokenDataPromise = Promise<{
  error: Error | null;
  data: string | null;
}>;

type RedisTimeUntilExpiryPromise = Promise<{
  error: Error | null;
  data: number | null;
}>;
