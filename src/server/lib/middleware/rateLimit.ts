import type { NextFunction } from 'express';
import { readEmailCookie } from '@/server/lib/emailCookie';
import { getConfiguration } from '@/server/lib/getConfiguration';
import type {
	BucketValues,
	RateLimiterConfiguration,
} from '@/server/lib/rate-limit';
import rateLimit from '@/server/lib/rate-limit';
import redisClient from '@/server/lib/redis/redisClient';
import { logger } from '@/server/lib/serverSideLogger';
import { trackMetric } from '@/server/lib/trackMetric';
import type {
	RequestWithTypedQuery,
	ResponseWithRequestState,
} from '@/server/models/Express';
import { rateLimitHitMetric } from '@/server/models/Metrics';
import { RateLimitErrors } from '@/shared/model/Errors';
import { ValidRoutePathsArray } from '@/shared/model/Routes';
import type { RoutePaths } from '@/shared/model/Routes';

const getBucketConfigForRoute = (
	route: RoutePaths,
	config: RateLimiterConfiguration,
) => config?.routeBuckets?.[route] ?? config.defaultBuckets;

const { rateLimiter } = getConfiguration();

export const rateLimiterMiddleware = async (
	req: RequestWithTypedQuery,
	res: ResponseWithRequestState,
	next: NextFunction,
) => {
	// Skip rate limiting if the rate limiter is disabled or the redis client not initialised.
	if (!rateLimiter.enabled || typeof redisClient === 'undefined') {
		return next();
	}

	// Gets the route in express path format, e.g: /welcome/:token
	// TODO: decide if we also want to rate limit against specific tokens
	const routePathDefinition = req.route.path;

	// All routes in ValidRoutePathsArray can be individually configured.
	// If the path does not exist in the array, we still rate limit
	// but only using the default configuration.
	// This logs when this happens so that we have visibility of these routes.
	if (!ValidRoutePathsArray.includes(routePathDefinition)) {
		logger.info(
			`RateLimit falling back to default configuration for unregistered path: ${routePathDefinition}`,
			undefined,
			{
				request_id: res.locals.requestId,
			},
		);
	}

	// Look for an email in form submissions and the encrypted email cookie
	const { email: formEmail = '' } = req.body;
	const encryptedStateEmail = readEmailCookie(req);

	const rateLimitData = {
		email: formEmail || encryptedStateEmail,
		ip: req.ip,
		accessToken:
			process.env.NODE_ENV === 'production'
				? req.signedCookies.GU_ACCESS_TOKEN
				: req.cookies.GU_ACCESS_TOKEN,
		oktaIdentifier: req.cookies.idx,
	} as BucketValues;

	const bucketConfiguration = getBucketConfigForRoute(
		routePathDefinition,
		rateLimiter,
	);

	const ratelimitBucketTypeIfHit = await rateLimit({
		route: routePathDefinition,
		bucketConfiguration,
		redisClient,
		bucketValues: rateLimitData,
	});

	if (ratelimitBucketTypeIfHit) {
		// Cut down the size of the access token so we don't make the log line too long.
		const truncatedAccessToken =
			typeof rateLimitData.accessToken === 'string'
				? rateLimitData.accessToken.substring(0, 6)
				: '';

		// We append `-Gateway` so that we can differentiate between IDAPI rate limit log entries.
		logger.info(
			`RateLimit-Gateway ${ratelimitBucketTypeIfHit}Bucket email=${rateLimitData.email} ip=${rateLimitData.ip} accessToken=${truncatedAccessToken} identity-gateway ${req.method} ${routePathDefinition}`,
			undefined,
			{
				request_id: res.locals.requestId,
			},
		);

		trackMetric(rateLimitHitMetric(ratelimitBucketTypeIfHit));

		// Don't rate limit users if we are configured to log only.
		// Also check for whether this is overridden on a per-route level as well as generally.
		const logOnlyOverride = bucketConfiguration?.settings?.logOnly;

		if (logOnlyOverride === true) {
			return next();
		}

		const isLogOnlyAndNotOverriddenAtTheRouteLevel =
			rateLimiter.settings?.logOnly === true && logOnlyOverride !== false;

		if (isLogOnlyAndNotOverriddenAtTheRouteLevel) {
			return next();
		}

		return res.status(429).send(RateLimitErrors.GENERIC);
	}

	return next();
};
