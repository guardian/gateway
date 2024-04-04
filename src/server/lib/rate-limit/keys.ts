import { RoutePaths } from '@/shared/model/Routes';
import { sha256 } from '@/server/lib/crypto';
import {
	RateLimiterBucketsConfiguration,
	BucketValues,
	BucketKeys,
	BucketType,
} from './types';

// Generates a unique key to store in Redis for a given route, bucket and value.
const getRateLimitKey = (
	route: RoutePaths,
	bucketName: BucketType,
	value?: string,
) => `gw-rl-${route}-${bucketName}${value ? '-' + sha256(value) : ''}`;

const removeEmailAlias = (email?: string) => {
	const removalRegex = /\+.*@/g;
	return email?.replace(removalRegex, '@');
};

export const getBucketKeys = (
	route: RoutePaths,
	bucketConfiguration: RateLimiterBucketsConfiguration,
	bucketValues?: BucketValues,
): BucketKeys => {
	const { accessTokenBucket, ipBucket, emailBucket, oktaIdentifierBucket } =
		bucketConfiguration;

	// No extra buckets are being used, return just the global bucket key.
	if (bucketValues === undefined) {
		return { globalKey: getRateLimitKey(route, 'global') };
	}

	const { accessToken, email, ip, oktaIdentifier } = bucketValues;

	// We remove aliases from emails to stop users from bypassing
	// the rate limit by re-using the same email multiple times.
	const safeEmail = removeEmailAlias(email);

	return {
		accessTokenKey:
			accessTokenBucket &&
			accessToken &&
			getRateLimitKey(route, 'accessToken', accessToken),
		emailKey:
			emailBucket && email && getRateLimitKey(route, 'email', safeEmail),
		ipKey: ipBucket && ip && getRateLimitKey(route, 'ip', ip),
		oktaIdentifierKey:
			oktaIdentifierBucket &&
			oktaIdentifier &&
			getRateLimitKey(route, 'oktaIdentifier', oktaIdentifier),
		globalKey: getRateLimitKey(route, 'global'),
	};
};
