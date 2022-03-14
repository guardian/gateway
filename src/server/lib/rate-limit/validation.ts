import { RateLimiterConfiguration } from '@/server/models/Configuration';
import {
  BucketConfiguration,
  RateLimitBucketsConfiguration,
} from '@/server/lib/rate-limit';

function isValidRateLimitConfig(obj: unknown): obj is RateLimiterConfiguration {
  const { defaultBuckets, routeBuckets } =
    obj as Partial<RateLimiterConfiguration>;

  if (defaultBuckets === undefined) {
    return false;
  }

  const defaultBucketsValid = checkBucketsValid(defaultBuckets);
  if (routeBuckets === undefined) {
    return defaultBucketsValid;
  }

  const invalidRouteFound = Object.values(routeBuckets).some((buckets) => {
    return !checkBucketsValid(buckets);
  });

  if (invalidRouteFound) {
    return false;
  }

  return defaultBucketsValid;
}

const checkBucketValid = (bucket: Partial<BucketConfiguration>) => {
  const { addTokenMs, capacity, maximumTimeBeforeTokenExpiry } = bucket;

  const maxTimeSet = maximumTimeBeforeTokenExpiry !== undefined;
  if (maxTimeSet && typeof maxTimeSet !== 'number') {
    return false;
  }

  const requiredValuesValid =
    typeof capacity === 'number' && typeof addTokenMs === 'number';

  return requiredValuesValid;
};

const checkBucketsValid = (buckets: Partial<RateLimitBucketsConfiguration>) => {
  const { globalBucket, ...optionalBuckets } = buckets;

  const globalBucketInvalid =
    globalBucket === undefined || !checkBucketValid(globalBucket);

  if (globalBucketInvalid) return false;

  const invalidBucketFound = Object.values(optionalBuckets).some(
    (bucket) => bucket !== undefined && !checkBucketValid(bucket),
  );

  if (invalidBucketFound) {
    return false;
  }

  return true;
};

export const validateRateLimiterConfiguration = (configuration: unknown) => {
  if (!isValidRateLimitConfig(configuration)) {
    throw new Error('Rate limiter configuration validation failed');
  }
  return configuration;
};
