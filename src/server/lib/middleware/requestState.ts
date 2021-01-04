// Middleware for assigning important parts of the request state to res.locals.
// This should be the only place res.locals is mutated.
// Requires: csurf middlware
import { getGeolocationRegion } from '@/server/lib/getGeolocationRegion';
import { getDefaultRequestState } from '@/server/models/Express';
import { parseExpressQueryParams } from '@/server/lib/queryParams';
import { NextFunction, Request, Response } from 'express';
import { getConfiguration } from '../getConfiguration';
import { tests } from '@/shared/model/experiments/abTests';
import { getABTesting } from '../getABTesting';

const getRequestState = (req: Request) => {
  // @TODO: default state is almost redundant at this stage
  const defaultState = getDefaultRequestState();
  const [abTesting, abTestAPI] = getABTesting(req, getConfiguration(), tests);
  return {
    ...defaultState,
    queryParams: parseExpressQueryParams(req.method, req.query),
    pageData: {
      geolocation: getGeolocationRegion(req),
    },
    csrf: {
      token: req.csrfToken(),
    },
    abTesting: abTesting,
    abTestAPI: abTestAPI,
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
