import { sha256 } from '../crypto';
import {
  RateLimitBucketsConfiguration,
  BucketValues,
  BucketKeys,
} from './types';

const getRateLimitKey = (name: string, bucketName: string, value?: string) =>
  `gw-rl-${name}-${bucketName}${value ? '-' + sha256(value) : ''}`;

export const getBucketKeys = (
  name: string,
  bucketConfiguration: RateLimitBucketsConfiguration,
  bucketValues?: BucketValues,
): BucketKeys => {
  const {
    accessTokenBucket,
    ipBucket,
    emailBucket,
    globalBucket,
    oktaIdentifierBucket,
  } = bucketConfiguration;

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
