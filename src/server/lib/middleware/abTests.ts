import { ResponseWithServerStateLocals } from '@/server/models/Express';
import { abTestsForMvtId, tests } from '@/shared/model/experiments/abTests';
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
  res.locals.forcedTestVariants = forcedTestVariants;

  // set up ab tests for given mvtId
  const abTests = abTestsForMvtId(res.locals.mvtId, forcedTestVariants);

  // get a list of tests to run
  const runnableTests = abTests.allRunnableTests(tests);

  // assign the variants to run
  // example:
  // {
  //   abTestTest: 'variant'
  // }
  runnableTests.forEach((test) => {
    res.locals.abTests[test.id] = {
      variant: test.variantToRun.id,
    };
  });

  next();
};
