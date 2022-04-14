import {
  RequestWithTypedQuery,
  ResponseWithRequestState,
} from '@/server/models/Express';
import { RoutePaths, ValidRoutePathsArray } from '@/shared/model/Routes';
import { NextFunction } from 'express';
import rateLimit, { RateLimiterConfiguration } from '@/server/lib/rate-limit';
import { getConfiguration } from '@/server/lib/getConfiguration';
import redisClient from '@/server/lib/redis/redisClient';
import { logger } from '@/server/lib/serverSideLogger';
import { trackMetric } from '@/server/lib/trackMetric';
import { rateLimitHitMetric } from '@/server/models/Metrics';
import { RateLimitErrors } from '@/shared/model/Errors';
import { readEmailCookie } from '@/server/lib/emailCookie';

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
  if (rateLimiter.enabled === false || typeof redisClient === 'undefined') {
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
    );
  }

  // Look for an email in form submissions and the encrypted email cookie
  const { email: formEmail = '' } = req.body;
  const encryptedStateEmail = readEmailCookie(req);

  const rateLimitData = {
    email: formEmail || encryptedStateEmail,
    ip: req.ip,
    accessToken: req.cookies.SC_GU_U,
  };

  const ratelimitBucketTypeIfHit = await rateLimit({
    route: routePathDefinition,
    bucketConfiguration: getBucketConfigForRoute(
      routePathDefinition,
      rateLimiter,
    ),
    redisClient,
    bucketValues: rateLimitData,
  });

  if (ratelimitBucketTypeIfHit) {
    // Cut down the size of the access token so we don't make the log line too long.
    const truncatedAccessToken = rateLimitData.accessToken
      ? rateLimitData.accessToken.substring(0, 6)
      : '';

    // We append `-Gateway` so that we can differentiate between IDAPI rate limit log entries.
    logger.info(
      `RateLimit-Gateway ${ratelimitBucketTypeIfHit}Bucket email=${rateLimitData.email} ip=${rateLimitData.ip} accessToken=${truncatedAccessToken} identity-gateway ${req.method} ${routePathDefinition}`,
    );

    trackMetric(rateLimitHitMetric(ratelimitBucketTypeIfHit));

    // Don't rate limit users if we are configured to log only.
    if (rateLimiter.settings?.logOnly === true) {
      return next();
    }

    return res.status(429).send(RateLimitErrors.GENERIC);
  }

  return next();
};
