import Redis from 'ioredis';
import { logger } from '@/server/lib/serverSideLogger';
import { LogLevel } from '@/shared/model/Logger';

export const startBucketCapacityLogger = (
  redisClient: Redis.Redis,
  interval = 10000,
) =>
  setInterval(async () => {
    const keys = await redisClient.keys('*-global');
    for (const key of keys) {
      const value = await redisClient.get(key);
      if (value) {
        const tokensLeft = JSON.parse(value)?.tokens;
        logger.log(LogLevel.INFO, `Bucket(${key})`, undefined, {
          bucket_capacity: tokensLeft,
        });
      }
    }
  }, interval);
