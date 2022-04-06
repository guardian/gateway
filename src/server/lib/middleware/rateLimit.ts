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
      `Rate limiter — falling back to default configuration for unregistered path: ${routePathDefinition}`,
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
    logger.info(
      `Rate limit hit for ${rateLimitData.ip} on request to ${req.path}. Bucket type: ${ratelimitBucketTypeIfHit}`,
    );

    trackMetric(rateLimitHitMetric(ratelimitBucketTypeIfHit));

    return res.status(429).send(RateLimitErrors.GENERIC);
  }

  return next();
};
