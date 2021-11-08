import { Express, RequestHandler, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { helmetMiddleware } from '@/server/lib/middleware/helmet';
import { loggerMiddleware } from '@/server/lib/middleware/logger';
import { csrfMiddleware } from '@/server/lib/middleware/csrf';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { requestStateMiddleware } from '@/server/lib/middleware/requestState';
import { default as routes } from '@/server/routes';
import { routeErrorHandler } from '@/server/lib/middleware/errorHandler';

const { appSecret } = getConfiguration();

export const applyMiddleware = (server: Express): void => {
  // apply helmet before anything else
  server.use(helmetMiddleware as RequestHandler);
  server.use(urlencoded({ extended: true }) as RequestHandler);
  server.use(cookieParser(appSecret));
  server.use(compression());
  server.use(loggerMiddleware);
  server.use(csrfMiddleware);
  server.use(requestStateMiddleware);
  server.use(routes);
  server.use(routeErrorHandler);
};
