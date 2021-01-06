// Middleware for assigning important parts of the request state to res.locals.
// This should be the only place res.locals is mutated.
// Requires: csurf middlware
import { getGeolocationRegion } from '@/server/lib/getGeolocationRegion';
import { parseExpressQueryParams } from '@/server/lib/queryParams';
import { NextFunction, Request, Response } from 'express';
import { getConfiguration } from '../getConfiguration';
import { tests } from '@/shared/model/experiments/abTests';
import { getABTesting } from '../getABTesting';
import { RequestState } from '@/server/models/Express';

const config = getConfiguration();
const { idapiBaseUrl } = config;

const getRequestState = (req: Request): RequestState => {
  const [abTesting, abTestAPI] = getABTesting(req, config, tests);
  return {
    queryParams: parseExpressQueryParams(req.method, req.query),
    pageData: {
      geolocation: getGeolocationRegion(req),
    },
    globalMessage: {},
    csrf: {
      token: req.csrfToken(),
    },
    abTesting: abTesting,
    abTestAPI: abTestAPI,
    clientHosts: {
      idapiBaseUrl,
    },
  };
};

export const requestStateMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const state = getRequestState(req);

  /* This is the only place mutation of res.locals should occur */
  /* eslint-disable-next-line functional/immutable-data */
  res.locals = state;

  next();
};
