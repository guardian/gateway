import { default as express, Express } from 'express';
import { logger } from '@/server/lib/serverSideLogger';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { applyMiddleware } from '@/server/lib/middleware';
import redisClient from '@/server/lib/redis/redisClient';
import { startBucketCapacityLogger } from '@/server/lib/rate-limit';

const { port, rateLimiter, stage } = getConfiguration();

const server: Express = express();

applyMiddleware(server);

const serverInstance = server.listen(port);

server.set('trust proxy', true);

logger.info(`server running on port ${port}`);

if (
  stage !== 'DEV' &&
  rateLimiter.enabled &&
  typeof redisClient !== 'undefined'
) {
  startBucketCapacityLogger(redisClient);
}

export default serverInstance;
