import { NextFunction, Request, Response } from 'express';
import Redis from 'ioredis';
import { getConfiguration } from '../getConfiguration';
import rateLimit from '../rate-limit';

const { redis } = getConfiguration();

const redisClient = new Redis({
  enableOfflineQueue: false,
  password: redis.password,
  host: redis.host,
});

export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const isRateLimited = await rateLimit({
    name: '/signin',
    redisClient,
    bucketConfiguration: {
      ipBucket: {
        addTokenMs: 1000,
        capacity: 1,
        name: 'ip',
        maximumTimeBeforeTokenExpiry: 21700, // 6 hours in seconds
      },
      globalBucket: {
        addTokenMs: 1000,
        capacity: 10,
        name: 'global',
        maximumTimeBeforeTokenExpiry: 21700, // 6 hours in seconds
      },
    },
    bucketValues: {
      ip: req.ip,
    },
  });

  if (isRateLimited) {
    res.status(429).send('Too Many Requests');
  } else {
    next();
  }
};
