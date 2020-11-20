import { ResponseWithServerStateLocals } from '@/server/models/Express';
import { abTestApiForMvtId, tests } from '@/shared/model/experiments/abTests';
import { Participations } from '@guardian/ab-core';
import { Request, NextFunction } from 'express';
import qs from 'query-string';

export const abTestMiddleware = (
  req: Request,
  res: ResponseWithServerStateLocals,
  next: NextFunction,
) => {
  // get forced test variants
  // need to be in { [key: string]: { variant: string } }; type (Participations)
  const queryParamsFromUrl = qs.parseUrl(req.url).query;
  const forcedTestVariants: Participations = {};
  Object.entries(queryParamsFromUrl).forEach(([key, value]) => {
    if (key.startsWith('ab-')) {
      forcedTestVariants[key.replace('ab-', '')] = {
        variant: value as string,
      };
    }
  });
  res.locals.abTesting.forcedTestVariants = forcedTestVariants;

  // set up ab tests for given mvtId
  const abTestAPI = abTestApiForMvtId(
    res.locals.abTesting.mvtId,
    forcedTestVariants,
  );

  // set the abTestAPI for this request chain
  res.locals.abTestAPI = abTestAPI;

  // get a list of tests to run
  const runnableTests = abTestAPI.allRunnableTests(tests);

  // assign the variants to run
  // example:
  // {
  //   ExampleTest: 'variant'
  // }
  runnableTests.forEach((test) => {
    res.locals.abTesting.participations[test.id] = {
      variant: test.variantToRun.id,
    };
  });

  next();
};
