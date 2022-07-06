import createServer from '@/server/server';
import { logger } from '@/server/lib/serverSideLogger';
import redisClient from '@/server/lib/redis/redisClient';
import { startGlobalBucketCapacityLogger } from '@/server/lib/rate-limit';
import { getConfiguration } from '@/server/lib/getConfiguration';
const { port, rateLimiter } = getConfiguration();

const server = createServer();

server.listen(port);

logger.info(`server running on port ${port}`);

if (
  rateLimiter.enabled &&
  typeof redisClient !== 'undefined' &&
  rateLimiter.settings?.trackBucketCapacity === true
) {
  startGlobalBucketCapacityLogger(redisClient, 5000);
}
