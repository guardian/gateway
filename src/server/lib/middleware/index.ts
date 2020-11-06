import { Express, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { helmetMiddleware } from './helmet';
import { loggerMiddleware } from './logger';
import { applyRoutes } from './routes';
import { csrfMiddleware } from '@/server/lib/middleware/csrf';
import { getConfiguration } from '@/server/lib/configuration';

const { appSecret } = getConfiguration();

export const applyMiddleware = (server: Express): void => {
  // apply helmet before anything else
  server.use(helmetMiddleware);

  server.use(urlencoded({ extended: true }));
  server.use(cookieParser(appSecret));
  server.use(compression());

  // logging middleware
  server.use(loggerMiddleware);

  server.use(csrfMiddleware);

  // add routes
  applyRoutes(server);
};
