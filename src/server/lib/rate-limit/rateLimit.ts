import type Redis from 'ioredis';
import { logger } from '../serverSideLogger';
import { rateLimitBucket, getBucketsFromRedis } from './bucket';
import { getBucketKeys } from './keys';
import type {
  RateLimit,
  RateLimitBucketsConfiguration,
  ParsedRateLimitBuckets,
} from './types';

const rateLimitBuckets = async (
  redisClient: Redis.Redis,
  buckets: ParsedRateLimitBuckets,
  bucketConfiguration: RateLimitBucketsConfiguration,
) => {
  const writePipeline = redisClient.pipeline();

  const oktaIdentifierNotHit = rateLimitBucket(
    buckets.oktaIdentifier,
    bucketConfiguration.oktaIdentifierBucket,
    writePipeline,
  );

  const accessTokenNotHit =
    oktaIdentifierNotHit &&
    rateLimitBucket(
      buckets.accessToken,
      bucketConfiguration.accessTokenBucket,
      writePipeline,
    );

  const emailNotHit =
    accessTokenNotHit &&
    rateLimitBucket(
      buckets.email,
      bucketConfiguration.emailBucket,
      writePipeline,
    );

  const ipNotHit =
    emailNotHit &&
    rateLimitBucket(buckets.ip, bucketConfiguration.ipBucket, writePipeline);

  const globalNotHit =
    ipNotHit &&
    rateLimitBucket(
      buckets.global,
      bucketConfiguration.globalBucket,
      writePipeline,
    );

  // Exec all awaiting read promises;
  console.time('Write time');
  await writePipeline.exec();
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

const rateLimit = async ({
  name,
  redisClient,
  bucketConfiguration,
  bucketValues,
}: RateLimit) => {
  const { accessTokenKey, globalKey, emailKey, ipKey, oktaIdentifierKey } =
    getBucketKeys(name, bucketConfiguration, bucketValues);

  try {
    const buckets = await getBucketsFromRedis(redisClient, {
      accessTokenKey,
      emailKey,
      ipKey,
      globalKey,
      oktaIdentifierKey,
    });

    const isRateLimited = await rateLimitBuckets(
      redisClient,
      buckets,
      bucketConfiguration,
    );

    return isRateLimited;
  } catch (e) {
    logger.error('Encountered an error fetching or parsing bucket data', e);
    return true;
  }
};

export default rateLimit;
