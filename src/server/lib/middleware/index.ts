import { default as express, Express, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import { helmetMiddleware } from './helmet';
import { loggerMiddleware } from './logger';
import { applyRoutes } from './routes';

export const applyMiddleware = (server: Express): void => {
  // apply helmet before anything else
  server.use(helmetMiddleware);

  server.use(urlencoded({ extended: true }));
  server.use(cookieParser());

  server.use('/static', express.static('static'));

  // logging middleware
  server.use(loggerMiddleware);

  // add routes
  applyRoutes(server);
};
