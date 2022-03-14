import { RoutePaths } from '@/shared/model/Routes';
import { sha256 } from '../crypto';
import {
  RateLimitBucketsConfiguration,
  BucketValues,
  BucketKeys,
  BucketType,
} from './types';

const getRateLimitKey = (
  route: RoutePaths,
  bucketName: BucketType,
  value?: string,
) => `gw-rl-${route}-${bucketName}${value ? '-' + sha256(value) : ''}`;

export const getBucketKeys = (
  route: RoutePaths,
  bucketConfiguration: RateLimitBucketsConfiguration,
  bucketValues?: BucketValues,
): BucketKeys => {
  const { accessTokenBucket, ipBucket, emailBucket, oktaIdentifierBucket } =
    bucketConfiguration;

  // No extra buckets are being used, return just the global bucket key.
  if (bucketValues === undefined) {
    return { globalKey: getRateLimitKey(route, 'global') };
  }

  const { accessToken, email, ip, oktaIdentifier } = bucketValues;

  return {
    accessTokenKey:
      accessTokenBucket &&
      accessToken &&
      getRateLimitKey(route, 'accessToken', accessToken),
    emailKey: emailBucket && email && getRateLimitKey(route, 'email', email),
    ipKey: ipBucket && ip && getRateLimitKey(route, 'ip', ip),
    oktaIdentifierKey:
      oktaIdentifierBucket &&
      oktaIdentifier &&
      getRateLimitKey(route, 'oktaIdentifier', oktaIdentifier),
    globalKey: getRateLimitKey(route, 'global'),
  };
};
