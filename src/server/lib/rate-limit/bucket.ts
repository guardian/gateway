import type Redis from 'ioredis';

import type {
  ParsedRateLimitBucket,
  RateLimitBucketContents,
  BucketKeys,
  BucketConfiguration,
  PipelinedBucketData,
} from './types';

/**
 * Implements the token bucket rate limiting algorithm.
 *
 * A token bucket to evaluate is passed into the method, along with
 * the bucket definition which defines the maximum capacity
 * and the rate at which new tokens are added to the bucket.
 *
 * If the bucket or bucket definition are undefined, we cannot
 * run the algorithm because we do not have enough information
 * so we exit early.
 *
 * There are then two possible paths of execution:
 *
 * Bucket does not exist in Redis:
 * ---
 *
 * We skip the token bucket algorithm
 * and write a new bucket record to Redis with the capacity set
 * to the maximum capacity minus one.
 *
 * Bucket exists in Redis:
 * ---
 *
 * The delta in time that has passed since the bucket was
 * last updated is used to calculate how many tokens to
 * add back to the bucket.
 *
 * The new bucket token count is then determined by
 * taking the bucket token count plus the new tokens or
 * the maximum bucket capacity, whichever is the smaller
 * of the two.
 *
 * If the bucket token count is still zero or less
 * we write the new bucket state back to Redis and then
 * return true, indicating that the rate limit has
 * been hit.
 *
 * If the bucket still has tokens remaining, a token is
 * subtracted from the bucket token count and we write the
 * new bucket state back to Redis. False is returned,
 * this indicates that the bucket rate limit has not been hit.
 *
 * See also {@link https://en.wikipedia.org/wiki/Token_bucket}
 *
 * @param bucket The bucket to rate limit against
 * @param bucketConfiguration The bucket definition
 * @param pipelinedWrites The Redis pipeline to batch write commands
 * @returns Boolean representing whether the rate limit has not been hit.
 */
export const rateLimitBucket = (
  bucket: ParsedRateLimitBucket | undefined,
  bucketConfiguration: BucketConfiguration | undefined,
  pipelinedWrites: Redis.Pipeline,
) => {
  // If either the bucket or the bucket configuration are undefined
  // we don't want to include this bucket in the rate limiting
  // process. We return true to effectively ignore this bucket.
  if (bucket === undefined || bucketConfiguration === undefined) {
    return true;
  }

  const maximumTimeBeforeExpiry =
    bucketConfiguration?.maximumTimeBeforeTokenExpiry || 21700; // Default to 6 hours in seconds

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
      maximumTimeBeforeExpiry,
    };

    pipelinedWrites
      .set(redisKey, JSON.stringify(rateLimitTokenData))
      .expire(redisKey, maximumTimeBeforeExpiry);

    return rateLimitNotHit;
  }

  // Bucket information was not defined, so we create a new record for this key.
  const rateLimitTokenData: RateLimitBucketContents = {
    tokens: bucketConfiguration.capacity - 1,
    maximumTimeBeforeExpiry,
  };

  pipelinedWrites
    .set(redisKey, JSON.stringify(rateLimitTokenData))
    .expire(redisKey, maximumTimeBeforeExpiry);

  return true;
};

export const getBucketsFromRedis = async (
  redisClient: Redis.Redis,
  bucketKeys: BucketKeys,
) => {
  const readPipeline = redisClient.pipeline();

  const { globalKey, accessTokenKey, emailKey, ipKey, oktaIdentifierKey } =
    bucketKeys;

  const globalBucket = getBucket(globalKey, readPipeline);
  const ipBucket = ipKey ? getBucket(ipKey, readPipeline) : undefined;
  const emailBucket = emailKey ? getBucket(emailKey, readPipeline) : undefined;
  const accessTokenBucket = accessTokenKey
    ? getBucket(accessTokenKey, readPipeline)
    : undefined;
  const oktaIdentifierBucket = oktaIdentifierKey
    ? getBucket(oktaIdentifierKey, readPipeline)
    : undefined;

  // Exec all awaiting read promises;
  await readPipeline.exec();

  // The promises will all have resolved now the pipeline exec has finished.
  return {
    accessToken: await accessTokenBucket,
    oktaIdentifier: await oktaIdentifierBucket,
    email: await emailBucket,
    ip: await ipBucket,
    global: await globalBucket,
  };
};

export const getPipelinedBucketData = (
  redisKey: string,
  pipeline: Redis.Pipeline,
): PipelinedBucketData => {
  return {
    redisKey,
    tokenData: new Promise((res) =>
      pipeline.get(redisKey, (error, data) => res({ error, data })),
    ),
    timeLeftUntilExpiry: new Promise((res) =>
      pipeline.pttl(redisKey, (error, data) => res({ error, data })),
    ),
  };
};

const getBucket = async (
  key: string,
  pipeline: Redis.Pipeline,
): Promise<ParsedRateLimitBucket> => {
  const pipelinedBucketData = getPipelinedBucketData(key, pipeline);

  const { redisKey, ...redisData } = pipelinedBucketData;

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

  // If no data is found for this bucket in Redis we leave the data
  // undefined so we know to store a new bucket in Redis.
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
