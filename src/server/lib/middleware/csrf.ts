import csrf from 'csurf';
import { NextFunction, Request } from 'express';
import { ResponseWithLocals } from '@/server/models/Express';
import { getConfiguration } from '@/server/lib/configuration';

const isHttps = getConfiguration().isHttps;

export const csurfMiddleware = csrf({
  cookie: {
    key: '_csrf',
    sameSite: true,
    secure: isHttps,
    httpOnly: true,
    signed: false, //TODO create a cookie secret for cookie-parser and set to true
  },
});

export const csrfLocalsMiddleware = (
  req: Request,
  res: ResponseWithLocals,
  next: NextFunction,
) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};

export const csrfMiddleware = [csurfMiddleware, csrfLocalsMiddleware];
