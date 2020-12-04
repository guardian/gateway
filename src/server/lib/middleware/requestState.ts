// Middleware for assigning important parts of the request state to res.locals.
// This should be the only place res.locals is mutated.
// Requires: csurf middlware
import { getGeolocationRegion } from '@/server/lib/getGeolocationRegion';
import { getDefaultServerState } from '@/server/models/Express';
import { getMvtId } from '@/server/lib/getMvtId';
import { getABForcedVariants } from '@/server/lib/getABForcedVariants';
import { parseExpressQueryParams } from '@/server/lib/queryParams';
import { NextFunction, Request, Response } from 'express';
import { getConfiguration } from '../getConfiguration';
import { abTestApiForMvtId, tests } from '@/shared/model/experiments/abTests';

export const requestStateMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const state = getDefaultServerState();
  state.queryParams = parseExpressQueryParams(req.method, req.query);
  state.pageData.geolocation = getGeolocationRegion(req);
  state.csrf.token = req.csrfToken();
  state.abTesting.mvtId = getMvtId(req, getConfiguration());
  state.abTesting.forcedTestVariants = getABForcedVariants(req);
  // set up ab tests for given mvtId
  const abTestAPI = abTestApiForMvtId(
    state.abTesting.mvtId,
    state.abTesting.forcedTestVariants,
  );
  // set the abTestAPI for this request chain
  state.abTestAPI = abTestAPI;
  // get a list of tests to run
  const runnableTests = abTestAPI.allRunnableTests(tests);
  // assign the variants to run
  // example:
  // {
  //   ExampleTest: 'variant'
  // }
  runnableTests.forEach((test) => {
    state.abTesting.participations[test.id] = {
      variant: test.variantToRun.id,
    };
  });

  res.locals = state;
  next();
};
