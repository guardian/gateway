import '@/server/lib/env';
import { default as express, Express } from 'express';
import { logger } from '@/server/lib/logger';
import { getConfiguration } from '@/server/lib/configuration';
import { applyMiddleware } from '@/server/lib/middleware';

const { port } = getConfiguration();

const server: Express = express();

applyMiddleware(server);

server.listen(port);
logger.info(`server running on port ${port}`);
