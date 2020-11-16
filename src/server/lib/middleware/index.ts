import { Express, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { helmetMiddleware } from '@/server/lib/middleware/helmet';
import { loggerMiddleware } from '@/server/lib/middleware/logger';
import { applyRoutes } from '@/server/lib/middleware/routes';
import { csrfMiddleware } from '@/server/lib/middleware/csrf';
import { getConfiguration } from '@/server/lib/configuration';
import { serverStateLocalsMiddleware } from '@/server/lib/middleware/serverStateLocals';

const { appSecret } = getConfiguration();

export const applyMiddleware = (server: Express): void => {
  // apply helmet before anything else
  server.use(helmetMiddleware);

  server.use(urlencoded({ extended: true }));
  server.use(cookieParser(appSecret));
  server.use(compression());

  // set up default state in res.locals
  server.use(serverStateLocalsMiddleware);

  // logging middleware
  server.use(loggerMiddleware);

  // csrf middleware
  server.use(csrfMiddleware);

  // add routes
  applyRoutes(server);
};
