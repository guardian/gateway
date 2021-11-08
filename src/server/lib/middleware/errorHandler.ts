import { NextFunction, Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { getCsrfPageUrl } from '@/server/lib/getCsrfPageUrl';
import { renderer } from '@/server/lib/renderer';
import { Routes } from '@/shared/model/Routes';
import { PageTitle } from '@/shared/model/PageTitle';
import { logger } from '@/server/lib/logger';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { getConfiguration } from '@/server/lib/getConfiguration';

const { defaultReturnUri } = getConfiguration();

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
    // we also have to manually build the query params object, as it may not be defined in an unexpected csrf error
    res.redirect(
      303,
      addQueryParamsToPath(
        getCsrfPageUrl(req),
        { ...res.locals.queryParams, returnUrl: defaultReturnUri },
        {
          csrfError: true,
        },
      ),
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
