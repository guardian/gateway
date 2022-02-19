import { NextFunction, Request, Response } from 'express';
import Redis from 'ioredis';
import { sha256 } from '../crypto';
import { getConfiguration } from '../getConfiguration';
import {
  executeRateLimitAndCheckIfLimitNotHit,
  getPipelinedDataForKey,
} from '../rateLimit';

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
  const rateLimiterName = 'signin';

  const rateLimitIpKeyName = `gw-rl-${rateLimiterName}-ip-${sha256(req.ip)}`;
  const rateLimitGlobalName = `gw-rl-${rateLimiterName}-global`;

  const pipelinedReads = redisClient.pipeline();

  const global = getPipelinedDataForKey(rateLimitGlobalName, pipelinedReads);
  const ip = getPipelinedDataForKey(rateLimitIpKeyName, pipelinedReads);

  // Exec all awaiting read promises;
  console.time('Read time');
  await pipelinedReads.exec();
  console.timeEnd('Read time');

  const pipelinedWrites = redisClient.pipeline();

  // Continue evaluating rate limits until one is hit.
  const ipNotHit = await executeRateLimitAndCheckIfLimitNotHit(
    ip,
    pipelinedWrites,
  );
  const globalNotHit =
    ipNotHit &&
    (await executeRateLimitAndCheckIfLimitNotHit(global, pipelinedWrites));

  // Exec all awaiting read promises;
  console.time('Write time');
  await pipelinedWrites.exec();
  console.timeEnd('Write time');

  if (!globalNotHit || !ipNotHit) {
    res.status(429).send('Too Many Requests');
    return;
  }

  next();
};
