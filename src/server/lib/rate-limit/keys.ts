import { sha256 } from '../crypto';
import {
  RateLimitBucketsConfiguration,
  BucketValues,
  BucketKeys,
  BucketType,
} from './types';

const getRateLimitKey = (
  name: string,
  bucketName: BucketType,
  value?: string,
) => `gw-rl-${name}-${bucketName}${value ? '-' + sha256(value) : ''}`;

export const getBucketKeys = (
  name: string,
  bucketConfiguration: RateLimitBucketsConfiguration,
  bucketValues?: BucketValues,
): BucketKeys => {
  const { accessTokenBucket, ipBucket, emailBucket, oktaIdentifierBucket } =
    bucketConfiguration;

  // No extra buckets are being used, return just the global bucket key.
  if (bucketValues === undefined) {
    return { globalKey: getRateLimitKey(name, 'global') };
  }

  const { accessToken, email, ip, oktaIdentifier } = bucketValues;

  return {
    accessTokenKey:
      accessTokenBucket &&
      accessToken &&
      getRateLimitKey(name, 'accessToken', accessToken),
    emailKey: emailBucket && email && getRateLimitKey(name, 'email', email),
    ipKey: ipBucket && ip && getRateLimitKey(name, 'ip', ip),
    oktaIdentifierKey:
      oktaIdentifierBucket &&
      oktaIdentifier &&
      getRateLimitKey(name, 'oktaIdentifier', oktaIdentifier),
    globalKey: getRateLimitKey(name, 'global'),
  };
};
