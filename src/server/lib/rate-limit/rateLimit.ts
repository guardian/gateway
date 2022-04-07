import type Redis from 'ioredis';
import { logger } from '@/server/lib/serverSideLogger';
import { rateLimitBucket, getBucketsFromRedis } from './bucket';
import { getBucketKeys } from './keys';
import type {
  RateLimitParameters,
  RateLimiterBucketsConfiguration,
  ParsedRateLimitBuckets,
  BucketType,
} from './types';

/**
 * Use this method to rate limit requests based on the
 * buckets defined and the values passed to them.
 *
 * All calls should include a name for the rate limiter,
 * an instance of ioredis and configurations for all of
 * the buckets in use. A configuration for the global
 * bucket must be provided.
 *
 * If a value is provided in bucketValues and the corresponding
 * bucket is defined in bucketConfiguration, a token will be
 * taken from the bucket under the hash of the value. If this
 * leaves the bucket empty, the name of the bucket that was
 * limited will be returned.
 *
 * Example:
 * ```
 * await rateLimit({
 *   name: '/signin',
 *   redisClient,
 *   bucketConfiguration: {
 *     ipBucket: { addTokenMs: 500, capacity: 2 },
 *     globalBucket: { addTokenMs: 500, capacity: 5 },
 *   },
 *   bucketValues: {
 *     ip: '127.0.0.1',
 *   }
 * })```
 *
 * If the example above is executed with the same ip two
 * times within 500ms the ipBucket will be empty and the
 * method will return false. User is not rate limited.
 *
 * Because the two requests above were made successfully,
 * the global rate limit bucket now has three tokens left.
 *
 * If a further request is made before 500ms has passed,
 * the rate limiter will kick in and return 'ip', indicating
 * that the ip bucket has been limited.
 *
 * @usage Examples of usage can be found in: rateLimit.test.ts
 *
 * @param {RateLimitParameters} params Rate limiter configuration
 * @returns Bucket type if rate limited, otherwise `false` if not rate limited.
 */
const rateLimit = async ({
  route,
  redisClient,
  bucketConfiguration,
  bucketValues,
}: RateLimitParameters) => {
  // If the route bucket configuration is disabled, we do not rate limit.
  // We enable all by default, config.enabled must be explicitly set to false.
  if (bucketConfiguration.enabled === false) {
    return false;
  }

  const { accessTokenKey, globalKey, emailKey, ipKey, oktaIdentifierKey } =
    getBucketKeys(route, bucketConfiguration, bucketValues);

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
    return false;
  }
};

const rateLimitBuckets = async (
  redisClient: Redis.Redis,
  buckets: ParsedRateLimitBuckets,
  bucketConfiguration: RateLimiterBucketsConfiguration,
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
  // If the request is not rate limited, we return false.
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

export default rateLimit;
