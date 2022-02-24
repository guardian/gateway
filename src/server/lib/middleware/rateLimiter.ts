import { NextFunction, Request, Response } from 'express';
import Redis from 'ioredis';
import { sha256 } from '../crypto';
import { readEmailCookie } from '../emailCookie';
import { getConfiguration } from '../getConfiguration';
import {
  executeRateLimitAndCheckIfLimitNotHit,
  getPipelinedDataForKey,
  RateLimiter,
} from '../rateLimit';

const { redisConfiguration } = getConfiguration();

const redisClient = new Redis({
  enableOfflineQueue: false,
  password: redisConfiguration.password,
  host: redisConfiguration.host,
});

const rateLimit = async ({
  rateLimiterConfig,
  ip,
  accessToken,
  email,
  oktaIdentifier,
}: RateLimiter) => {
  const {
    name,
    // accessTokenBucketDefinition,
    ipBucketDefinition,
    // emailBucketDefinition,
    globalBucketDefinition,
    // oktaIdentifierBucketDefinition,
  } = rateLimiterConfig;

  // const rateLimitAccessTokenKey =
  //   accessTokenBucketDefinition &&
  //   accessToken &&
  //   `gw-rl-${name}-${accessTokenBucketDefinition?.name}-${sha256(accessToken)}`;

  // const rateLimitOktaIdentifierKey =
  //   oktaIdentifierBucketDefinition &&
  //   oktaIdentifier &&
  //   `gw-rl-${name}-${oktaIdentifierBucketDefinition?.name}-${sha256(
  //     oktaIdentifier,
  //   )}`;

  // const rateLimitEmailKey =
  //   email && `gw-rl-${name}-${emailBucketDefinition?.name}-${sha256(email)}`;

  const rateLimitIpKey =
    ipBucketDefinition &&
    ip &&
    `gw-rl-${name}-${ipBucketDefinition?.name}-${sha256(ip)}`;

  const rateLimitGlobalKey =
    globalBucketDefinition && `gw-rl-${name}-${globalBucketDefinition?.name}`;

  const pipelinedReads = redisClient.pipeline();

  const globalTokenData =
    rateLimitGlobalKey &&
    getPipelinedDataForKey(rateLimitGlobalKey, pipelinedReads);

  const ipTokenData =
    rateLimitIpKey && getPipelinedDataForKey(rateLimitIpKey, pipelinedReads);

  // Exec all awaiting read promises;
  console.time('Read time');
  // await pipelinedReads.exec();
  console.timeEnd('Read time');

  const pipelinedWrites = redisClient.pipeline();

  // Continue evaluating rate limits until one is hit.
  const ipNotHit =
    ipTokenData &&
    (await executeRateLimitAndCheckIfLimitNotHit(
      ipTokenData,
      ipBucketDefinition,
      pipelinedWrites,
    ));

  const globalNotHit =
    ipNotHit &&
    globalTokenData &&
    (await executeRateLimitAndCheckIfLimitNotHit(
      globalTokenData,
      globalBucketDefinition,
      pipelinedWrites,
    ));

  // Exec all awaiting read promises;
  console.time('Write time');
  await pipelinedWrites.exec();
  console.timeEnd('Write time');

  return !globalNotHit || !ipNotHit;
};

export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const isRateLimited = await rateLimit({
    name: 'signin',
    buckets: {
      ipBucketDefinition: { addTokenMs: 100, capacity: 100, name: 'ip' }, // test values
      globalBucketDefinition: {
        addTokenMs: 100,
        capacity: 100,
        name: 'global',
      },
    },
    ip: req.ip,
    email: readEmailCookie(req),
    accessToken: undefined,
    oktaIdentifier: undefined,
  });

  if (isRateLimited) {
    res.status(429).send('Too Many Requests');
  } else {
    next();
  }
};
