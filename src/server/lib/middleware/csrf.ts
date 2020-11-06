import csrf from 'csurf';
import { NextFunction, Request } from 'express';
import { ResponseWithLocals } from '@/server/models/Express';
import { getConfiguration } from '@/server/lib/configuration';

const { isHttps } = getConfiguration();

const updateCsrfPageUrlMiddleware = (
  req: Request,
  res: ResponseWithLocals,
  next: NextFunction,
) => {
  const protectedMethods = ['POST', 'PATCH', 'PUT', 'DELETE'];
  res.locals.csrf = {};

  // We redirect to pageUrl on CSRF error. It is the URL of the GET for the original form
  if (!protectedMethods.includes(req.method)) {
    res.locals.csrf.pageUrl = req.url;
  } else {
    res.locals.csrf.pageUrl = req.body._csrfPageUrl ?? req.url;
  }

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
  res: ResponseWithLocals,
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
