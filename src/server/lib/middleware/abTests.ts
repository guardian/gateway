import { ResponseWithServerStateLocals } from '@/server/models/Express';
import { abTestsForMvtId, tests } from '@/shared/model/experiments/abTests';
import { Request, NextFunction } from 'express';

export const abTestMiddleware = (
  _: Request,
  res: ResponseWithServerStateLocals,
  next: NextFunction,
) => {
  // set up ab tests for given mvtId
  const abTests = abTestsForMvtId(res.locals.mvtId);

  // get a list of tests to run
  const runnableTests = abTests.allRunnableTests(tests);

  // assign the variants to run
  // example:
  // {
  //   abTestTest: 'variant'
  // }
  runnableTests.forEach((test) => {
    res.locals.abTests[test.id] = test.variantToRun.id;
  });

  next();
};
