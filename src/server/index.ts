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
import { Main } from '../client/main';
import path from 'path';
import { getConfiguration } from '@/server/lib/configuration';
import { APIFetch } from '@/server/lib/APIFetch';

const { port, apiKey, apiEndpoint } = getConfiguration();
const server: Express = express();

const loggerMiddleware = (req: Request, _, next: NextFunction) => {
  logger.info(`${req.method}, ${req.path}`);
  next();
};

server.use(express.urlencoded({ extended: true }));
server.use(loggerMiddleware);
server.use('/static', express.static(path.resolve(__dirname, 'static')));
server.get('/healthcheck', (_, res: Response) => {
  res.sendStatus(204);
});

server.post('/reset', async (req: Request, res: Response) => {
  // @TODO: REFACTOR
  const { email = '' } = req.body;
  const fetch = APIFetch(apiEndpoint);
  const options = {
    method: 'POST',
    headers: {
      'X-GU-ID-Client-Access-Token': `Bearer ${apiKey}`,
      'X-Forwarded-For': req.ip,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'email-address': email,
      returnUrl: '',
    }),
  };
  try {
    const result = await fetch(`/pwd-reset/send-password-reset-email`, options);
    console.log('RESULT:', result);
  } catch (e) {
    console.log(e);
  }
  res.redirect(303, '/reset/sent');
});

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
