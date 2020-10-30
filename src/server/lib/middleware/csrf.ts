import csrf from 'csurf';
import { Express, NextFunction, Request } from 'express';
import { ResponseWithLocals } from '@/server/models/Express';
import { getConfiguration } from '@/server/lib/configuration';

const isHttps = getConfiguration().isHttps;

const csrfMiddleware = csrf({
  cookie: {
    key: '_csrf',
    sameSite: true,
    secure: isHttps,
    httpOnly: true,
  },
});

const csrfLocalsMiddleware = (
  req: Request,
  res: ResponseWithLocals,
  next: NextFunction,
) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};

export const addCsrfMiddleware = (server: Express) => {
  server.use(csrfMiddleware);
  server.use(csrfLocalsMiddleware);
};
