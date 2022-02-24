import { NextFunction, Request, Response } from 'express';
import Redis from 'ioredis';
import { sha256 } from '../crypto';
import { readEmailCookie } from '../emailCookie';
import { getConfiguration } from '../getConfiguration';
import {
  executeRateLimitAndCheckIfLimitNotHit,
  fetchAndParseBucketsFromPipelinedData,
  RateLimiter,
} from '../rateLimit';
import { logger } from '../serverSideLogger';

const { redisConfiguration } = getConfiguration();

const redisClient = new Redis({
  enableOfflineQueue: false,
  password: redisConfiguration.password,
  host: redisConfiguration.host,
});

const getRateLimitKey = (name: string, bucketName: string, value?: string) =>
  `gw-rl-${name}-${bucketName}${value ? '-' + sha256(value) : ''}`;

const rateLimit = async ({
  name,
  buckets,
  ip,
  accessToken,
  email,
  oktaIdentifier,
}: RateLimiter) => {
  const {
    accessTokenBucketDefinition,
    ipBucketDefinition,
    emailBucketDefinition,
    globalBucketDefinition,
    oktaIdentifierBucketDefinition,
  } = buckets;

  const accessTokenKey =
    accessTokenBucketDefinition &&
    accessToken &&
    getRateLimitKey(name, accessTokenBucketDefinition.name, accessToken);

  const oktaIdKey =
    oktaIdentifierBucketDefinition &&
    oktaIdentifier &&
    getRateLimitKey(name, oktaIdentifierBucketDefinition.name, oktaIdentifier);

  const emailKey =
    emailBucketDefinition &&
    email &&
    getRateLimitKey(name, emailBucketDefinition.name, email);

  const ipKey =
    ipBucketDefinition &&
    ip &&
    getRateLimitKey(name, ipBucketDefinition.name, ip);

  const globalKey = getRateLimitKey(name, globalBucketDefinition.name);

  try {
    const buckets = await fetchAndParseBucketsFromPipelinedData(redisClient, {
      accessTokenKey,
      oktaIdKey,
      emailKey,
      ipKey,
      globalKey,
    });

    const pipelinedWrites = redisClient.pipeline();

    // Continue evaluating rate limits until one is hit.
    const oktaNotHit = buckets.oktaIdentifier
      ? oktaIdentifierBucketDefinition !== undefined &&
        executeRateLimitAndCheckIfLimitNotHit(
          buckets.oktaIdentifier,
          oktaIdentifierBucketDefinition,
          pipelinedWrites,
        )
      : true;

    const accessTokenNotHit =
      oktaNotHit && buckets.accessToken
        ? accessTokenBucketDefinition !== undefined &&
          executeRateLimitAndCheckIfLimitNotHit(
            buckets.accessToken,
            accessTokenBucketDefinition,
            pipelinedWrites,
          )
        : true;

    const emailNotHit =
      accessTokenNotHit && buckets.email
        ? emailBucketDefinition !== undefined &&
          executeRateLimitAndCheckIfLimitNotHit(
            buckets.email,
            emailBucketDefinition,
            pipelinedWrites,
          )
        : true;

    const ipNotHit =
      emailNotHit && buckets.ip
        ? ipBucketDefinition !== undefined &&
          executeRateLimitAndCheckIfLimitNotHit(
            buckets.ip,
            ipBucketDefinition,
            pipelinedWrites,
          )
        : true;

    const globalNotHit =
      ipNotHit && buckets.global
        ? executeRateLimitAndCheckIfLimitNotHit(
            buckets.global,
            globalBucketDefinition,
            pipelinedWrites,
          )
        : false;

    // Exec all awaiting read promises;
    console.time('Write time');
    await pipelinedWrites.exec();
    console.timeEnd('Write time');

    return (
      !globalNotHit ||
      !ipNotHit ||
      !emailNotHit ||
      !accessTokenNotHit ||
      !oktaNotHit
    );
  } catch (e) {
    logger.error('Encountered an error fetching bucket data', e);
  }
};

export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const isRateLimited = await rateLimit({
    name: 'signin',
    buckets: {
      ipBucketDefinition: { addTokenMs: 1000, capacity: 1, name: 'ip' },
      globalBucketDefinition: {
        addTokenMs: 1000,
        capacity: 10,
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
