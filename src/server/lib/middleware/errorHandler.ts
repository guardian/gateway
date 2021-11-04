import { NextFunction, Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { getCsrfPageUrl } from '@/server/lib/getCsrfPageUrl';
import { renderer } from '@/server/lib/renderer';
import { Routes } from '@/shared/model/Routes';
import { PageTitle } from '@/shared/model/PageTitle';
import { logger } from '@/server/lib/logger';
import { addQueryParamsToPath } from '@/server/lib/queryParams';

export const routeErrorHandler = (
  // eslint-disable-next-line
  err: any, // ErrorRequestHandler uses type any
  req: Request,
  res: ResponseWithRequestState,
  next: NextFunction,
) => {
  if (err.code === 'EBADCSRFTOKEN') {
    // handle CSRF token errors here
    // we attempt to redirect to res.locals.csrf.pageUrl provided by a hidden form field falling back to req.url
    // we use res.locals.csrf.pageUrl since the URL might not be GET-able if the request was a POST
    res.redirect(
      303,
      addQueryParamsToPath(getCsrfPageUrl(req), res.locals.queryParams, {
        csrfError: true,
      }),
    );
    return next(err);
  }

  logger.error('unexpected error', err);

  const html = renderer(`${Routes.UNEXPECTED_ERROR}`, {
    requestState: res.locals,
    pageTitle: PageTitle.UNEXPECTED_ERROR,
  });
  return res.status(500).type('html').send(html);
};
