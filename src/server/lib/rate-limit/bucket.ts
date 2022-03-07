import type Redis from 'ioredis';

import type {
  ParsedRateLimitBucket,
  RateLimitBucketContents,
  BucketKeys,
  BucketConfiguration,
  PipelinedBucketData,
} from './types';

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
      maximumTimeBeforeExpiry: bucketConfiguration.maximumTimeBeforeTokenExpiry,
    };

    pipelinedWrites
      .set(redisKey, JSON.stringify(rateLimitTokenData))
      .expire(redisKey, bucketConfiguration.maximumTimeBeforeTokenExpiry);

    return rateLimitNotHit;
  }

  // Bucket information was not defined, so we create a new record for this key.
  const rateLimitTokenData: RateLimitBucketContents = {
    tokens: bucketConfiguration.capacity - 1,
    maximumTimeBeforeExpiry: bucketConfiguration.maximumTimeBeforeTokenExpiry,
  };

  pipelinedWrites
    .set(redisKey, JSON.stringify(rateLimitTokenData))
    .expire(redisKey, bucketConfiguration.maximumTimeBeforeTokenExpiry);

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
