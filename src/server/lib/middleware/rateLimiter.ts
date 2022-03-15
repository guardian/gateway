import { RateLimiterConfiguration } from '@/server/models/Configuration';
import { RequestWithTypedQuery } from '@/server/models/Express';
import { RoutePaths } from '@/shared/model/Routes';
import { NextFunction, Response } from 'express';

import rateLimit from '@/server/lib/rate-limit';
import rateLimiter from 'rate-limit-config';
import redisClient from '@/server/lib/redis/redisClient';

const getBucketConfigForRoute = (
  route: RoutePaths,
  config: RateLimiterConfiguration,
) => config?.routeBuckets?.[route] ?? config.defaultBuckets;

export const rateLimiterMiddleware = async (
  req: RequestWithTypedQuery,
  res: Response,
  next: NextFunction,
) => {
  if (!redisClient) {
    return next();
  }

  // Gets the route in the form /welcome/:token
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
    return res.status(429).send("Sorry, you've hit the rate limit");
  }

  return next();
};
