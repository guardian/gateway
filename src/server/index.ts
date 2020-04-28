import {
  default as express,
  Express,
  NextFunction,
  Request,
  Response,
} from 'express';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { logger } from '@/server/lib/logger';
import { Main } from '@/client/main';
import { getConfiguration } from '@/server/lib/configuration';
import { default as routes } from '@/server/routes';

const { port } = getConfiguration();
const server: Express = express();

const loggerMiddleware = (req: Request, _: Response, next: NextFunction) => {
  logger.info(`${req.method}, ${req.path}`);
  next();
};

server.use(express.urlencoded({ extended: true }));
server.use(loggerMiddleware);

server.use(routes);

server.use((req: Request, res: Response) => {
  const context = {};

  const react = ReactDOMServer.renderToString(
    React.createElement(
      StaticRouter,
      {
        location: req.url,
        context,
      },
      React.createElement(Main),
    ),
  );

  const html = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset='utf-8' />
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Gateway</title>
    </head>
    <body style="margin:0">
      <div id="app">${react}</div>
    </body>
  </html>`;
  res.type('html');
  res.send(html);
});

server.listen(port);
logger.info(`server running on port ${port}`);
