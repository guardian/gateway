import type Redis from 'ioredis';

interface RateLimitTokenData {
  tokens: number;
  maxTtlSeconds: number;
}

interface RateLimitData {
  redisKey: string;
  value: RateLimitTokenData;
  remainingTimeMs: number;
}

interface BucketDefinition {
  name: string;
  capacity: number;
  addTokenMs: number;
}

export interface RateLimitConfig {
  name: string;
  globalBucketDefinition?: BucketDefinition;
  accessTokenBucketDefinition?: BucketDefinition;
  ipBucketDefinition?: BucketDefinition;
  emailBucketDefinition?: BucketDefinition;
  oktaIdentifierBucketDefinition?: BucketDefinition;
}

export interface RateLimiter {
  rateLimiterConfig: RateLimitConfig;
  accessToken?: string;
  ip?: string;
  email?: string;
  oktaIdentifier?: string;
}

// type RateLimitType =
//   | 'oktaIdentifier'
//   | 'accessToken'
//   | 'ip'
//   | 'global'
//   | 'email';

export const getPipelinedDataForKey = (
  key: string,
  pipeline: Redis.Pipeline,
) => {
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

export const fromPipelinedData = async (pipelinedData: PipelinedData) => {
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

export const executeRateLimitAndCheckIfLimitNotHit = async (
  pipelinedData: PipelinedData,
  bucketDefinition: BucketDefinition,
  pipelinedWrites: Redis.Pipeline,
) => {
  const maxTtlSeconds = 21700; // 6 hours in seconds

  try {
    // Rate limit existing key ..
    const parsed = await fromPipelinedData(pipelinedData);

    const timePassedMs =
      parsed.value.maxTtlSeconds * 1000 - parsed.remainingTimeMs;

    const newTokensAccumulated = Math.floor(
      timePassedMs / bucketDefinition.addTokenMs,
    );

    const tokensPlusAccumulated = Math.min(
      parsed.value.tokens + newTokensAccumulated,
      bucketDefinition.capacity,
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
      tokens: bucketDefinition.capacity - 1,
      maxTtlSeconds,
    };

    pipelinedWrites
      .set(pipelinedData.redisKey, JSON.stringify(rateLimitTokenData))
      .expire(pipelinedData.redisKey, maxTtlSeconds);

    return true;
  }
};
