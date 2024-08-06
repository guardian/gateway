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
	redisClient: Redis,
	interval: number,
): NodeJS.Timer =>
	// eslint-disable-next-line @typescript-eslint/no-misused-promises -- fire and forget, we handle errors internally to the promise
	setInterval(async () => {
		try {
			const keys = await redisClient.pipeline().keys('*-global').exec();

			if (keys) {
				// Flatten the result from Redis.
				const globalKeys = keys[0][1];
				if (Array.isArray(globalKeys) && globalKeys.length > 0) {
					const globalValues = await redisClient.mget(globalKeys);

					if (globalValues) {
						logValues(globalKeys, globalValues);
					}
				}
			}
		} catch (e) {
			logger.error('Unable to log global bucket values', e);
		}
	}, interval);

const logValues = (keys: string[], values: (string | null)[]) => {
	keys.forEach((key, index) => {
		const value = values[index];
		if (value) {
			const tokensLeft = JSON.parse(value)?.tokens;
			logger.log(LogLevel.INFO, `Bucket(${key})`, undefined, {
				bucket_capacity: tokensLeft,
			});
		}
	});
};
