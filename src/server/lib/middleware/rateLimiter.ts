import { RateLimiterConfiguration } from '@/server/models/Configuration';
import { RequestWithTypedQuery } from '@/server/models/Express';
import { RoutePaths } from '@/shared/model/Routes';
import { NextFunction, Response } from 'express';
import { getConfiguration } from '../getConfiguration';
import rateLimit from '../rate-limit';

import redisClient from '../redis/client';

const getBucketConfigForRoute = (
  route: RoutePaths,
  config: RateLimiterConfiguration,
) => config?.routeBuckets?.[route] ?? config.defaultBuckets;

export const rateLimiterMiddleware = async (
  req: RequestWithTypedQuery,
  res: Response,
  next: NextFunction,
) => {
  const { rateLimiter } = getConfiguration();
  console.log(req.path);
  console.log(res.locals.rateLimitData);

  const isRatelimited = await rateLimit({
    route: '/signin',
    bucketConfiguration: getBucketConfigForRoute('/signin', rateLimiter),
    redisClient,
    bucketValues: res.locals.rateLimitData,
  });

  if (isRatelimited) {
    res.status(429).send("Sorry, you've hit the rate limit");
  } else {
    next();
  }
};
