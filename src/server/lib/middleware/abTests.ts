import { ResponseWithServerStateLocals } from '@/server/models/Express';
import { abTestApiForMvtId, tests } from '@/shared/model/experiments/abTests';
import { getABForcedVariants } from '@/server/lib/getABForcedVariants';
import { Request, NextFunction } from 'express';

export const abTestMiddleware = (
  req: Request,
  res: ResponseWithServerStateLocals,
  next: NextFunction,
) => {
  const forcedTestVariants = getABForcedVariants(req);
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
