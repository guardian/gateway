import Redis from 'ioredis';
import { logger } from '@/server/lib/serverSideLogger';
import { LogLevel } from '@/shared/model/Logger';

/**
 * Starts a timer to keep track of global bucket capacity
 * for all of our routes by adding a log entry.
 *
 * @param redisClient An instance of Redis.
 * @param interval Time in seconds before the next log entry is made.
 * @returns {NodeJS.Timer}
 */
export const startGlobalBucketCapacityLogger = (
  redisClient: Redis.Redis,
  interval: number,
): NodeJS.Timer =>
  setInterval(async () => {
    const keys = await redisClient.pipeline().keys('*-global').exec();

    if (keys) {
      // Flatten the result from Redis.
      const globalKeys = keys[0][1];
      const globalValues = await redisClient.mget(globalKeys);

      if (globalValues) {
        logValues(globalKeys, globalValues);
      }
    }
  }, interval);

const logValues = (keys: string[], values: (string | null)[]) => {
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = values[i];
    if (value) {
      const tokensLeft = JSON.parse(value)?.tokens;
      logger.log(LogLevel.INFO, `Bucket(${key})`, undefined, {
        bucket_capacity: tokensLeft,
      });
    }
  }
};
