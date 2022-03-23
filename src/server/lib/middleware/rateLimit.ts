import {
  RequestWithTypedQuery,
  ResponseWithRequestState,
} from '@/server/models/Express';
import { RoutePaths, ValidRoutePathsArray } from '@/shared/model/Routes';
import { NextFunction } from 'express';
import rateLimit, { RateLimiterConfiguration } from '@/server/lib/rate-limit';
import { getConfiguration } from '../getConfiguration';
import redisClient from '@/server/lib/redis/redisClient';
import { logger } from '@/server/lib/serverSideLogger';
import { trackMetric } from '../trackMetric';
import { rateLimitHitMetric } from '@/server/models/Metrics';
import { RatelimitErrors } from '@/shared/model/Errors';

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

  if (!ValidRoutePathsArray.includes(routePathDefinition)) {
    logger.warn(
      'Rate limiting against an invalid route path. Falling back to default bucket configuration',
    );
  }

  const ratelimitBucketTypeIfHit = await rateLimit({
    route: routePathDefinition,
    bucketConfiguration: getBucketConfigForRoute(
      routePathDefinition,
      rateLimiter,
    ),
    redisClient,
    bucketValues: res.locals.rateLimitData,
  });

  if (ratelimitBucketTypeIfHit) {
    logger.info(
      `Rate limit hit for ${res.locals.rateLimitData.ip} on request to ${req.path}. Bucket type: ${ratelimitBucketTypeIfHit}`,
    );

    trackMetric(rateLimitHitMetric(ratelimitBucketTypeIfHit));

    return res.status(429).send(RatelimitErrors.GENERIC);
  }

  return next();
};
