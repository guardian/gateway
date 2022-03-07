import type Redis from 'ioredis';
import { logger } from '@/server/lib/serverSideLogger';
import { rateLimitBucket, getBucketsFromRedis } from './bucket';
import { getBucketKeys } from './keys';
import type {
  RateLimitParameters,
  RateLimitBucketsConfiguration,
  ParsedRateLimitBuckets,
  BucketType,
} from './types';

const rateLimitBuckets = async (
  redisClient: Redis.Redis,
  buckets: ParsedRateLimitBuckets,
  bucketConfiguration: RateLimitBucketsConfiguration,
): Promise<BucketType | false> => {
  const writePipeline = redisClient.pipeline();

  const oktaIdentifierNotHit = rateLimitBucket(
    buckets.oktaIdentifier,
    bucketConfiguration.oktaIdentifierBucket,
    writePipeline,
  );

  const emailNotHit =
    oktaIdentifierNotHit &&
    rateLimitBucket(
      buckets.email,
      bucketConfiguration.emailBucket,
      writePipeline,
    );

  const ipNotHit =
    emailNotHit &&
    rateLimitBucket(buckets.ip, bucketConfiguration.ipBucket, writePipeline);

  const accessTokenNotHit =
    ipNotHit &&
    rateLimitBucket(
      buckets.accessToken,
      bucketConfiguration.accessTokenBucket,
      writePipeline,
    );

  const globalNotHit =
    accessTokenNotHit &&
    rateLimitBucket(
      buckets.global,
      bucketConfiguration.globalBucket,
      writePipeline,
    );

  // Exec all awaiting read promises;
  await writePipeline.exec();

  // Return the type of bucket that was limited, in the order of precedence they were applied.
  if (!oktaIdentifierNotHit) {
    return 'oktaIdentifier';
  } else if (!emailNotHit) {
    return 'email';
  } else if (!ipNotHit) {
    return 'ip';
  } else if (!accessTokenNotHit) {
    return 'accessToken';
  } else if (!globalNotHit) {
    return 'global';
  } else {
    return false;
  }
};

const rateLimit = async ({
  name,
  redisClient,
  bucketConfiguration,
  bucketValues,
}: RateLimitParameters) => {
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
