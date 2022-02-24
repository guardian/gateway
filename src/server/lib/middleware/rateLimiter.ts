import { NextFunction, Request, Response } from 'express';
import Redis from 'ioredis';
import { sha256 } from '../crypto';
import { readEmailCookie } from '../emailCookie';
import { getConfiguration } from '../getConfiguration';
import {
  executeRateLimitAndCheckIfLimitNotHit,
  getPipelinedBucketDataForKey,
  parseBucketFromPipelinedData,
  RateLimiter,
} from '../rateLimit';
import { logger } from '../serverSideLogger';

const { redisConfiguration } = getConfiguration();

const redisClient = new Redis({
  enableOfflineQueue: false,
  password: redisConfiguration.password,
  host: redisConfiguration.host,
});

const rateLimit = async ({
  name,
  buckets,
  ip,
  accessToken,
  email,
  oktaIdentifier,
}: RateLimiter) => {
  const {
    // accessTokenBucketDefinition,
    ipBucketDefinition,
    // emailBucketDefinition,
    globalBucketDefinition,
    // oktaIdentifierBucketDefinition,
  } = buckets;

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

  const globalTokenData = getPipelinedBucketDataForKey(
    rateLimitGlobalKey,
    pipelinedReads,
  );

  const ipTokenData = rateLimitIpKey
    ? getPipelinedBucketDataForKey(rateLimitIpKey, pipelinedReads)
    : undefined;

  // Exec all awaiting read promises;
  console.time('Read time');
  await pipelinedReads.exec();
  console.timeEnd('Read time');

  try {
    const globalTokenBucket = await parseBucketFromPipelinedData(
      globalTokenData,
    );

    const ipTokenBucket = ipTokenData
      ? await parseBucketFromPipelinedData(ipTokenData)
      : undefined;

    const pipelinedWrites = redisClient.pipeline();

    // Continue evaluating rate limits until one is hit.
    const ipNotHit =
      ipTokenBucket &&
      ipBucketDefinition &&
      (await executeRateLimitAndCheckIfLimitNotHit(
        ipTokenBucket,
        ipBucketDefinition,
        pipelinedWrites,
      ));

    const globalNotHit =
      ipNotHit &&
      globalTokenData &&
      (await executeRateLimitAndCheckIfLimitNotHit(
        globalTokenBucket,
        globalBucketDefinition,
        pipelinedWrites,
      ));

    // Exec all awaiting read promises;
    console.time('Write time');
    await pipelinedWrites.exec();
    console.timeEnd('Write time');

    return !globalNotHit || !ipNotHit;
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
      ipBucketDefinition: { addTokenMs: 100, capacity: 100, name: 'ip' }, // test values
      globalBucketDefinition: {
        addTokenMs: 1000,
        capacity: 2,
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
