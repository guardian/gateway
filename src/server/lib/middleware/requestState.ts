// Middleware for assigning important parts of the request state to res.locals.
// This should be the only place res.locals is mutated.
// Requires: csurf middlware
import { getGeolocationRegion } from '@/server/lib/getGeolocationRegion';
import { parseExpressQueryParams } from '@/server/lib/queryParams';
import { NextFunction, Response } from 'express';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { tests } from '@/shared/model/experiments/abTests';
import { getABTesting } from '@/server/lib/getABTesting';
import { RequestState, RequestWithTypedQuery } from '@/server/models/Express';

const { idapiBaseUrl, oauthBaseUrl, googleRecaptcha } = getConfiguration();

const getRequestState = (req: RequestWithTypedQuery): RequestState => {
  const [abTesting, abTestAPI] = getABTesting(req, tests);

  // tracking parameters might be from body too
  const { ref, refViewId } = req.body;
  const queryParams = parseExpressQueryParams(req.method, req.query, {
    ref,
    refViewId,
  });

  return {
    queryParams,
    pageData: {
      geolocation: getGeolocationRegion(req),
      returnUrl: queryParams.returnUrl,
    },
    globalMessage: {},
    csrf: {
      token: req.csrfToken(),
    },
    abTesting: abTesting,
    abTestAPI: abTestAPI,
    clientHosts: {
      idapiBaseUrl,
      oauthBaseUrl,
    },
    recaptchaConfig: { recaptchaSiteKey: googleRecaptcha.siteKey },
  };
};

export const requestStateMiddleware = (
  req: RequestWithTypedQuery,
  res: Response,
  next: NextFunction,
) => {
  const state = getRequestState(req);

  /* This is the only place mutation of res.locals should occur */
  /* eslint-disable-next-line functional/immutable-data */
  res.locals = state;

  next();
};
