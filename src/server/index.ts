import { default as express, Express } from 'express';
import { logger } from '@/server/lib/logger';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { applyMiddleware } from '@/server/lib/middleware';

const { port } = getConfiguration();

export const server: Express = express();

applyMiddleware(server);

server.listen(port);
server.set('trust proxy', true);
logger.info(`server running on port ${port}`);
