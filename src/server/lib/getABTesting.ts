import { ABTesting } from '@/server/models/Express';
import { getMvtId } from './getMvtId';
import { Request } from 'express';
import { getABForcedVariants } from './getABForcedVariants';
import { abTestApiForMvtId } from '@/shared/model/experiments/abTests';
import { ABTest, ABTestAPI, Runnable } from '@guardian/ab-core';

export const getABTesting = (
  req: Request,
  tests: ABTest[],
): [ABTesting, ABTestAPI] => {
  const mvtId = getMvtId(req);
  const forcedTestVariants = getABForcedVariants(req);

  const abTestAPI = abTestApiForMvtId(mvtId, forcedTestVariants);

  const runnableTests = abTestAPI.allRunnableTests(tests);

  const participations = runnableTests.map((test: Runnable) => {
    return [
      test.id,
      {
        variant: test.variantToRun.id,
      },
    ];
  });

  const abTesting: ABTesting = {
    mvtId,
    forcedTestVariants,
    participations: Object.fromEntries(participations),
  };

  return [abTesting, abTestAPI];
};
