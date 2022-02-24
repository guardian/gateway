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
interface RateLimitBucket {
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
interface RateLimitBucketContents {
  // The number of tokens left in the bucket.
  tokens: number;

  // The maximum time in milliseconds after creation before the bucket records are deleted.
  maximumTimeBeforeExpiry: number;
}

interface BucketConfiguration {
  name: string;
  capacity: number;
  addTokenMs: number;
}

export interface RateLimiter {
  name: string;
  buckets: Buckets;
  accessToken?: string;
  ip?: string;
  email?: string;
  oktaIdentifier?: string;
}

/**
 * All of the available bucket types that can be passed to
 * an instance of the rate limiter. Every rate limiter requires a
 * global bucket definition, but the other buckets are optional.
 */
export interface Buckets {
  globalBucketDefinition: BucketConfiguration;
  accessTokenBucketDefinition?: BucketConfiguration;
  ipBucketDefinition?: BucketConfiguration;
  emailBucketDefinition?: BucketConfiguration;
  oktaIdentifierBucketDefinition?: BucketConfiguration;
}

// type RateLimitType =
//   | 'oktaIdentifier'
//   | 'accessToken'
//   | 'ip'
//   | 'global'
//   | 'email';

type RedisTokenDataPromise = {
  error: Error | null;
  data: string | null;
};

type RedisTimeUntilExpiryPromise = {
  error: Error | null;
  data: number | null;
};

export const getPipelinedBucketDataForKey = (
  key: string,
  pipeline: Redis.Pipeline,
) => {
  return {
    redisKey: key,
    tokenData: new Promise<RedisTokenDataPromise>((res) =>
      pipeline.get(key, (error, data) => res({ error, data })),
    ),
    timeLeftUntilExpiry: new Promise<RedisTimeUntilExpiryPromise>((res) =>
      pipeline.pttl(key, (error, data) => res({ error, data })),
    ),
  };
};

type PipelinedData = ReturnType<typeof getPipelinedBucketDataForKey>;

export const parseBucketFromPipelinedData = async (
  pipelinedData: PipelinedData,
): Promise<RateLimitBucket> => {
  const { redisKey, ...redisData } = pipelinedData;

  const [tokenDataResult, timeLeftUntilExpiryResult] = await Promise.all([
    redisData.tokenData,
    redisData.timeLeftUntilExpiry,
  ]);

  const tokenDataValue = tokenDataResult.data;
  const timeLeftUntilExpiry = timeLeftUntilExpiryResult.data;

  // If an error occurred while fetching data from Redis
  if (tokenDataResult.error) {
    throw tokenDataResult.error;
  } else if (timeLeftUntilExpiryResult.error) {
    throw timeLeftUntilExpiryResult.error;
  }

  // If no data is found for this bucket in Redis, we return undefined
  // we know to create a new bucket in the calling function.
  if (tokenDataValue === null || timeLeftUntilExpiry === null) {
    return {
      redisKey,
    };
  }

  try {
    // If we are able to parse the bucket data, return it to the caller.
    const tokenData: RateLimitBucketContents = JSON.parse(tokenDataValue);
    return {
      redisKey,
      timeLeftUntilExpiry,
      tokenData,
    };
  } catch (e) {
    throw e;
  }
};

export const executeRateLimitAndCheckIfLimitNotHit = async (
  bucket: RateLimitBucket,
  bucketConfiguration: BucketConfiguration,
  pipelinedWrites: Redis.Pipeline,
) => {
  const maxTtlSeconds = 21700; // 6 hours in seconds

  const { redisKey, timeLeftUntilExpiry, tokenData } = bucket;
  const bucketExists =
    timeLeftUntilExpiry !== undefined && tokenData !== undefined;

  if (bucketExists) {
    // Calculate how much time has passed in milliseconds since the last token was removed.
    const timePassedMs =
      tokenData.maximumTimeBeforeExpiry * 1000 - timeLeftUntilExpiry;

    // Calculate how many new tokens have been accumulated during that time.
    const newTokensAccumulated = Math.floor(
      timePassedMs / bucketConfiguration.addTokenMs,
    );

    // Calculate the new amount of tokens in the bucket.
    // Set to the max capacity if the accumulated value is higher.
    const tokensPlusAccumulated = Math.min(
      tokenData.tokens + newTokensAccumulated,
      bucketConfiguration.capacity,
    );

    // If the rate limit is hit, the new token count will be currentTokens + accumulated
    // If not hit, the new token count will be will be (currentTokens - 1) + accumulated
    const accumulatedTokensMinusUsed = tokensPlusAccumulated - 1;
    const rateLimitNotHit = accumulatedTokensMinusUsed >= 0;
    const newTokenCount = rateLimitNotHit
      ? accumulatedTokensMinusUsed
      : tokensPlusAccumulated;

    // Write the updated token count for this
    const rateLimitTokenData: RateLimitBucketContents = {
      tokens: newTokenCount,
      maximumTimeBeforeExpiry: maxTtlSeconds,
    };

    pipelinedWrites
      .set(redisKey, JSON.stringify(rateLimitTokenData))
      .expire(redisKey, maxTtlSeconds);

    return rateLimitNotHit;
  }

  // Bucket information was not defined, so we create a new record for this key.
  const rateLimitTokenData: RateLimitBucketContents = {
    tokens: bucketConfiguration.capacity - 1,
    maximumTimeBeforeExpiry: maxTtlSeconds,
  };

  pipelinedWrites
    .set(redisKey, JSON.stringify(rateLimitTokenData))
    .expire(redisKey, maxTtlSeconds);

  return true;
};
