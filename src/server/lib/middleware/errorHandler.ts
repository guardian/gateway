import { NextFunction, Request } from 'express';
import { ResponseWithServerStateLocals } from '@/server/models/Express';

const appendQueryParameter = (url: string, parameters: string) => {
  if (url.split('?').pop()?.includes(parameters)) {
    return url;
  }
  if (url.includes('?')) {
    return `${url}&${parameters}`;
  } else {
    return `${url}?${parameters}`;
  }
};

export const routeErrorHandler = (
  // eslint-disable-next-line
  err: any, // ErrorRequestHandler uses type any
  req: Request,
  res: ResponseWithServerStateLocals,
  next: NextFunction,
) => {
  if (err.code === 'EBADCSRFTOKEN') {
    // handle CSRF token errors here
    // we attempt to redirect to res.locals.csrf.pageUrl provided by a hidden form field falling back to req.url
    // we use res.locals.csrf.pageUrl since the URL might not be GET-able if the request was a POST
    res.redirect(
      303,
      appendQueryParameter(
        res.locals.csrf.pageUrl ?? req.url,
        'csrfError=true',
      ),
    );
  }

  return next(err);
};
