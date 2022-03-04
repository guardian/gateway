import { NextFunction, Request, Response } from 'express';
import Redis from 'ioredis';
import { readEmailCookie } from '../emailCookie';
import { getConfiguration } from '../getConfiguration';
import rateLimit from '../rateLimit';

const { redisConfiguration } = getConfiguration();

const redisClient = new Redis({
  enableOfflineQueue: false,
  password: redisConfiguration.password,
  host: redisConfiguration.host,
});

export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const isRateLimited = await rateLimit({
    name: 'signin',
    redisClient,
    bucketDefinitions: {
      ipBucket: { addTokenMs: 1000, capacity: 1, name: 'ip' },
      globalBucket: {
        addTokenMs: 1000,
        capacity: 10,
        name: 'global',
      },
    },
    bucketValues: {
      ip: req.ip + Math.random(), // are we rate limiting fastly by accident potentially?
      email: readEmailCookie(req), // POST body, read email cookie, maybe: encrypted email param
      accessToken: undefined, // which IDAPI token is it? (user/session?) .. pull Identity ID from sc_gu, then RL against that instead?
      oktaIdentifier: undefined,
    },
  });

  if (isRateLimited) {
    res.status(429).send('Too Many Requests');
  } else {
    next();
  }
};
