import { default as express, Express } from 'express';
import { logger } from '@/server/lib/serverSideLogger';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { applyMiddleware } from '@/server/lib/middleware';

const { port } = getConfiguration();

const server: Express = express();

applyMiddleware(server);

export default server.listen(port);

server.set('trust proxy', true);

logger.info(`server running on port ${port}`);
