import csrf from 'csurf';
import { NextFunction, Request } from 'express';
import { ResponseWithServerStateLocals } from '@/server/models/Express';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { getCsrfPageUrl } from '@/server/lib/getCsrfPageUrl';

const { isHttps } = getConfiguration();

const updateCsrfPageUrlMiddleware = (
  req: Request,
  res: ResponseWithServerStateLocals,
  next: NextFunction,
) => {
  res.locals.csrf = {};
  res.locals.csrf.pageUrl = getCsrfPageUrl(req);
  next();
};

const csurfMiddleware = csrf({
  cookie: {
    key: '_csrf',
    sameSite: true,
    secure: isHttps,
    httpOnly: true,
    signed: true,
  },
});

const updateCsrfTokenMiddleware = (
  req: Request,
  res: ResponseWithServerStateLocals,
  next: NextFunction,
) => {
  res.locals.csrf.token = req.csrfToken();
  next();
};

export const csrfMiddleware = [
  updateCsrfPageUrlMiddleware,
  csurfMiddleware,
  updateCsrfTokenMiddleware,
];
