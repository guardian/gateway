import { NextFunction, Request, Response } from 'express';
import Redis, { Pipeline } from 'ioredis';
import { sha256 } from '../crypto';
import { getConfiguration } from '../getConfiguration';

const { rateLimitConfiguration } = getConfiguration();

const redisClient = new Redis({
  enableOfflineQueue: false,
  password: rateLimitConfiguration.redisPassword,
});

interface RateLimitTokenData {
  tokens: number;
  maxTtlSeconds: number;
}

interface RateLimitData {
  redisKey: string;
  value: RateLimitTokenData;
  remainingTimeMs: number;
}

const getPipelinedDataForKey = (key: string, pipeline: Pipeline) => {
  return {
    redisKey: key,
    data: new Promise<{
      tokenDataError: Error | null;
      tokenDataValue: string | null;
    }>((res) =>
      pipeline.get(key, (tokenDataError, tokenDataValue) =>
        res({ tokenDataError, tokenDataValue }),
      ),
    ),
    remainingTimeMs: new Promise<{
      remainingTimeMsError: Error | null;
      remainingTimeMs: number | null;
    }>((res) =>
      pipeline.pttl(key, (remainingTimeMsError, remainingTimeMs) =>
        res({ remainingTimeMsError, remainingTimeMs }),
      ),
    ),
  };
};

type PipelinedData = ReturnType<typeof getPipelinedDataForKey>;

const fromPipelinedData = async (pipelinedData: PipelinedData) => {
  const { redisKey, ...redisData } = pipelinedData;

  const values = await Promise.all([redisData.data, redisData.remainingTimeMs]);

  const [tokenData, remainingTime] = values;
  const { tokenDataValue } = tokenData;
  const { remainingTimeMs } = remainingTime;

  if (tokenDataValue === null || remainingTimeMs === null) {
    throw new Error('No data found for key');
  }

  try {
    const value: RateLimitTokenData = JSON.parse(tokenDataValue);

    return {
      redisKey,
      remainingTimeMs,
      value,
    } as RateLimitData;
  } catch (e) {
    throw new Error('Error parsing token data');
  }
};

export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const rateLimiterName = 'signin';

  const bucketCapacity = 1;
  const bucketAddTokenMs = 333;

  const maxTtlSeconds = 43200; // 12 hours in seconds

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

  const executeRateLimitAndCheckIfLimitNotHit = async (
    pipelinedData: PipelinedData,
    pipelinedWrites: Redis.Pipeline,
  ) => {
    try {
      // Rate limit existing key ..
      const parsed = await fromPipelinedData(pipelinedData);

      const timePassedMs =
        parsed.value.maxTtlSeconds * 1000 - parsed.remainingTimeMs;

      const newTokensAccumulated = Math.floor(timePassedMs / bucketAddTokenMs);

      const tokensPlusAccumulated = Math.min(
        parsed.value.tokens + newTokensAccumulated,
        bucketCapacity,
      );

      const [tokensMinusUsed, noHit] = (() => {
        if (tokensPlusAccumulated - 1 >= 0) {
          return [tokensPlusAccumulated - 1, true];
        } else {
          return [tokensPlusAccumulated, false];
        }
      })();

      const rateLimitTokenData: RateLimitTokenData = {
        tokens: tokensMinusUsed,
        maxTtlSeconds,
      };

      pipelinedWrites
        .set(pipelinedData.redisKey, JSON.stringify(rateLimitTokenData))
        .expire(pipelinedData.redisKey, maxTtlSeconds);

      return noHit;
    } catch {
      // Rate limit new key ..

      const rateLimitTokenData: RateLimitTokenData = {
        tokens: bucketCapacity - 1,
        maxTtlSeconds,
      };

      pipelinedWrites
        .set(pipelinedData.redisKey, JSON.stringify(rateLimitTokenData))
        .expire(pipelinedData.redisKey, maxTtlSeconds);

      return true;
    }
  };

  // Continue evaluating rate limits until one is hit.
  const ipNotHit = await executeRateLimitAndCheckIfLimitNotHit(
    ip,
    pipelinedWrites,
  );
  const globalNotHit =
    ipNotHit &&
    (await executeRateLimitAndCheckIfLimitNotHit(global, pipelinedWrites));

  if (!globalNotHit || !ipNotHit) {
    res.status(429).send('Too Many Requests');
    return;
  }

  // Exec all awaiting read promises;
  console.time('Write time');
  await pipelinedWrites.exec();
  console.timeEnd('Write time');

  // const pipelineWrites = redisClient.pipeline();
  // pipelineReads.set(rateLimitGlobalName, [1]);
  // const red = await pipelineWrites.exec();
  // await redisClient.set(rateLimitGlobalName, 'test');

  // requests.flatMap((value, i) => {
  //   const [name, data, ttl] = value;
  //   return;
  // });

  next();
  // const rateLimitAccessToken = `token-${sha256('')}`;
  // const rateLimitEmail = `email-${sha256('')}`;
  // const rateLimitOktaToken = `okta-${sha256('')}`;

  // try {
  //   const rateLimitedIp = await burstyLimiter.consume(rateLimitIpKey, 1);
  //   const rateLimitedGlobal =
  //     rateLimitedIp.remainingPoints !== 0 &&
  //     (await burstyLimiter.consume('global', 1));
  //   next();
  // } catch (e: unknown) {
  //   res.status(429).send('Too Many Requests');
  // }
};
