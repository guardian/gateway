// Middleware for assigning important parts of the request state to res.locals.
// This should be the only place res.locals is mutated.
// Requires: csurf middlware
import { getGeolocationRegion } from '@/server/lib/getGeolocationRegion';
import { getDefaultServerState } from '@/server/models/Express';
import { getCsrfPageUrl } from '@/server/lib/getCsrfPageUrl';
import { getMvtId } from '@/server/lib/getMvtId';
import { getABForcedVariants } from '@/server/lib/getABForcedVariants';
import { parseExpressQueryParams } from '@/server/lib/queryParams';
import { NextFunction, Request, Response } from 'express';
import { getConfiguration } from '../getConfiguration';
import { abTestApiForMvtId, tests } from '@/shared/model/experiments/abTests';

export const requestState = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // @TODO: serverStateLocals
  const state = getDefaultServerState(); // @TODO: Rename this getter & maybe make a factory to build it up.
  // @TODO: queryParams
  state.queryParams = parseExpressQueryParams(req.method, req.query);
  // @TODO: geolocation
  state.pageData.geolocation = getGeolocationRegion(req);
  // @TODO: csrf[updatePageUrlMiddleware]
  state.csrf.pageUrl = getCsrfPageUrl(req);
  // @TODO: csrf[csurfMiddlware]
  // This should be separately loaded before this middleware, otherwise called manually
  // @TODO: csrf[updateCsrfTokenMiddleware]
  state.csrf.token = req.csrfToken();
  // Requires above
  // @TODO: mvtIds
  state.abTesting.mvtId = getMvtId(req, getConfiguration());
  // @TODO: abTests - Could be request parser with mvtIds
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

  // @TODO: locals assignation
  res.locals = state;
  // @TODO: next call
  next();
};
