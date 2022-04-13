import { default as express, Express } from 'express';
import { logger } from '@/server/lib/serverSideLogger';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { applyMiddleware } from '@/server/lib/middleware';
import redisClient from '@/server/lib/redis/redisClient';
import { startGlobalBucketCapacityLogger } from '@/server/lib/rate-limit';

const { port, rateLimiter } = getConfiguration();

const server: Express = express();

applyMiddleware(server);

const serverInstance = server.listen(port);

server.set('trust proxy', true);

logger.info(`server running on port ${port}`);

if (
  rateLimiter.enabled &&
  typeof redisClient !== 'undefined' &&
  rateLimiter.settings?.trackBucketCapacity === true
) {
  startGlobalBucketCapacityLogger(redisClient, 5000);
}

export default serverInstance;
