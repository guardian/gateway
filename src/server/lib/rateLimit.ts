import type Redis from 'ioredis';
import { sha256 } from './crypto';
import { logger } from './serverSideLogger';

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

interface RateLimiter {
  name: string;
  redisClient: Redis.Redis;
  bucketDefinitions: Buckets;
  bucketValues?: {
    ip?: string;
    email?: string;
    accessToken?: string;
    oktaIdentifier?: string;
  };
}

/**
 * All of the available bucket types that can be passed to
 * an instance of the rate limiter. Every rate limiter requires a
 * global bucket definition, but the other buckets are optional.
 */
export interface Buckets {
  globalBucket: BucketConfiguration;
  accessTokenBucket?: BucketConfiguration;
  ipBucket?: BucketConfiguration;
  emailBucket?: BucketConfiguration;
  oktaIdentifierBucket?: BucketConfiguration;
}

type RedisTokenDataPromise = {
  error: Error | null;
  data: string | null;
};

type RedisTimeUntilExpiryPromise = {
  error: Error | null;
  data: number | null;
};

const getPipelinedBucketDataForKey = (
  redisKey: string,
  pipeline: Redis.Pipeline,
) => {
  return {
    redisKey,
    tokenData: new Promise<RedisTokenDataPromise>((res) =>
      pipeline.get(redisKey, (error, data) => res({ error, data })),
    ),
    timeLeftUntilExpiry: new Promise<RedisTimeUntilExpiryPromise>((res) =>
      pipeline.pttl(redisKey, (error, data) => res({ error, data })),
    ),
  };
};

type PipelinedData = {
  redisKey: string;
  tokenData: Promise<RedisTokenDataPromise>;
  timeLeftUntilExpiry: Promise<RedisTimeUntilExpiryPromise>;
};

const getParsedBucketPromise = (key: string, pipeline: Redis.Pipeline) =>
  parseBucketFromPipelinedData(getPipelinedBucketDataForKey(key, pipeline));

const rateLimit = async ({
  name,
  redisClient,
  bucketDefinitions,
  bucketValues,
}: RateLimiter) => {
  const { accessTokenKey, globalKey, emailKey, ipKey, oktaIdentifierKey } =
    getRateLimitKeys(name, bucketDefinitions, bucketValues);

  try {
    const buckets = await fetchAndParseBucketsFromPipelinedData(redisClient, {
      accessTokenKey,
      emailKey,
      ipKey,
      globalKey,
      oktaIdentifierKey,
    });

    const isRateLimited = await rateLimitBuckets(
      redisClient,
      buckets,
      bucketDefinitions,
    );

    return isRateLimited;
  } catch (e) {
    logger.error('Encountered an error fetching bucket data', e);
    return true;
  }
};

export default rateLimit;

const fetchAndParseBucketsFromPipelinedData = async (
  redisClient: Redis.Redis,
  buckets: {
    accessTokenKey?: string;
    oktaIdentifierKey?: string;
    emailKey?: string;
    ipKey?: string;
    globalKey: string;
  },
) => {
  const readPipeline = redisClient.pipeline();
  const { globalKey, accessTokenKey, emailKey, ipKey, oktaIdentifierKey } =
    buckets;

  const globalBucket = getParsedBucketPromise(globalKey, readPipeline);
  const ipBucket = ipKey
    ? getParsedBucketPromise(ipKey, readPipeline)
    : undefined;
  const emailBucket = emailKey
    ? getParsedBucketPromise(emailKey, readPipeline)
    : undefined;
  const accessTokenBucket = accessTokenKey
    ? getParsedBucketPromise(accessTokenKey, readPipeline)
    : undefined;
  const oktaIdentifierBucket = oktaIdentifierKey
    ? getParsedBucketPromise(oktaIdentifierKey, readPipeline)
    : undefined;

  // Exec all awaiting read promises;
  console.time('Read time');
  await readPipeline.exec();
  console.timeEnd('Read time');

  return {
    accessToken: await accessTokenBucket,
    oktaIdentifier: await oktaIdentifierBucket,
    email: await emailBucket,
    ip: await ipBucket,
    global: await globalBucket,
  };
};

const rateLimitBuckets = async (
  redisClient: Redis.Redis,
  buckets: {
    accessToken: RateLimitBucket | undefined;
    oktaIdentifier: RateLimitBucket | undefined;
    email: RateLimitBucket | undefined;
    ip: RateLimitBucket | undefined;
    global: RateLimitBucket;
  },
  bucketDefinitions: Buckets,
) => {
  const pipelinedWrites = redisClient.pipeline();

  const oktaIdentifierNotHit = executeRateLimitAndCheckIfLimitNotHit(
    buckets.oktaIdentifier,
    bucketDefinitions.oktaIdentifierBucket,
    pipelinedWrites,
  );
  const accessTokenNotHit =
    oktaIdentifierNotHit &&
    executeRateLimitAndCheckIfLimitNotHit(
      buckets.accessToken,
      bucketDefinitions.accessTokenBucket,
      pipelinedWrites,
    );
  const emailNotHit =
    accessTokenNotHit &&
    executeRateLimitAndCheckIfLimitNotHit(
      buckets.email,
      bucketDefinitions.emailBucket,
      pipelinedWrites,
    );

  const ipNotHit =
    emailNotHit &&
    executeRateLimitAndCheckIfLimitNotHit(
      buckets.ip,
      bucketDefinitions.ipBucket,
      pipelinedWrites,
    );

  const globalNotHit =
    ipNotHit &&
    executeRateLimitAndCheckIfLimitNotHit(
      buckets.global,
      bucketDefinitions.globalBucket,
      pipelinedWrites,
    );

  // Exec all awaiting read promises;
  console.time('Write time');
  await pipelinedWrites.exec();
  console.timeEnd('Write time');

  // The rate limit reached if any bucket is hit.
  const rateLimitReached =
    !oktaIdentifierNotHit ||
    !accessTokenNotHit ||
    !emailNotHit ||
    !ipNotHit ||
    !globalNotHit;

  return rateLimitReached;
};

const parseBucketFromPipelinedData = async (
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

const executeRateLimitAndCheckIfLimitNotHit = (
  bucket: RateLimitBucket | undefined,
  bucketConfiguration: BucketConfiguration | undefined,
  pipelinedWrites: Redis.Pipeline,
) => {
  // If either the bucket or the bucket configuration are undefined
  // we don't want to include this bucket in the rate limiting
  // process. We return true to effectively ignore this bucket.
  if (bucket === undefined || bucketConfiguration === undefined) {
    return true;
  }

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

const getRateLimitKey = (name: string, bucketName: string, value?: string) =>
  `gw-rl-${name}-${bucketName}${value ? '-' + sha256(value) : ''}`;

const getRateLimitKeys = (
  name: string,
  bucketDefinitions: Buckets,
  bucketValues?: {
    ip?: string;
    email?: string;
    accessToken?: string;
    oktaIdentifier?: string;
  },
) => {
  const {
    accessTokenBucket,
    ipBucket,
    emailBucket,
    globalBucket,
    oktaIdentifierBucket,
  } = bucketDefinitions;

  // No extra buckets are being used, return just the global bucket key.
  if (bucketValues === undefined) {
    return { globalKey: getRateLimitKey(name, globalBucket.name) };
  }

  const { accessToken, email, ip, oktaIdentifier } = bucketValues;

  return {
    accessTokenKey:
      accessTokenBucket &&
      accessToken &&
      getRateLimitKey(name, accessTokenBucket.name, accessToken),
    emailKey:
      emailBucket && email && getRateLimitKey(name, emailBucket.name, email),
    ipKey: ipBucket && ip && getRateLimitKey(name, ipBucket.name, ip),
    oktaIdentifierKey:
      oktaIdentifierBucket &&
      oktaIdentifier &&
      getRateLimitKey(name, oktaIdentifierBucket.name, oktaIdentifier),
    globalKey: getRateLimitKey(name, globalBucket.name),
  };
};
