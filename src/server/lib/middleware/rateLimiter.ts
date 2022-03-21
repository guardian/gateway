import { RequestWithTypedQuery } from '@/server/models/Express';
import { RoutePaths } from '@/shared/model/Routes';
import { NextFunction, Response } from 'express';

import rateLimit, { RateLimiterConfiguration } from '@/server/lib/rate-limit';
import { getConfiguration } from '../getConfiguration';
import redisClient from '../redis/redisClient';

const getBucketConfigForRoute = (
  route: RoutePaths,
  config: RateLimiterConfiguration,
) => config?.routeBuckets?.[route] ?? config.defaultBuckets;

const { rateLimiter } = getConfiguration();

export const rateLimiterMiddleware = async (
  req: RequestWithTypedQuery,
  res: Response,
  next: NextFunction,
) => {
  // Skip rate limiting if the rate limiter is disabled or the redis client not initialised.
  if (rateLimiter.enabled === false || typeof redisClient === 'undefined') {
    return next();
  }

  // Gets the route in express path format, e.g: /welcome/:token
  // TODO: decide if we also want to rate limit against specific tokens
  const routePathDefinition = req.route.path;
  const isRatelimited = await rateLimit({
    route: routePathDefinition,
    bucketConfiguration: getBucketConfigForRoute(
      routePathDefinition,
      rateLimiter,
    ),
    redisClient,
    bucketValues: res.locals.rateLimitData,
  });

  if (isRatelimited) {
    return res
      .status(429)
      .send('Rate limit exceeded — please wait a few moments then try again ');
  }

  return next();
};
