// Middleware for assigning important parts of the request state to res.locals.
// This should be the only place res.locals is mutated.
// Requires: csurf middlware
import { getGeolocationRegion } from '@/server/lib/getGeolocationRegion';
import { getDefaultServerState } from '@/server/models/Express';
import { parseExpressQueryParams } from '@/server/lib/queryParams';
import { NextFunction, Request, Response } from 'express';
import { getConfiguration } from '../getConfiguration';
import { tests } from '@/shared/model/experiments/abTests';
import { getABTesting } from '../getABTesting';

export const requestStateMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const state = getDefaultServerState();
  state.queryParams = parseExpressQueryParams(req.method, req.query);
  state.pageData.geolocation = getGeolocationRegion(req);
  state.csrf.token = req.csrfToken();

  const [abTesting, abTestAPI] = getABTesting(req, getConfiguration(), tests);
  state.abTesting = abTesting;
  state.abTestAPI = abTestAPI;

  res.locals = state;
  next();
};
