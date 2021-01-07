import { ABTesting } from '@/server/models/Express';
import { Configuration } from '../models/Configuration';
import { getMvtId } from './getMvtId';
import { Request } from 'express';
import { getABForcedVariants } from './getABForcedVariants';
import { abTestApiForMvtId } from '@/shared/model/experiments/abTests';
import { ABTest, ABTestAPI, Runnable } from '@guardian/ab-core';

export const getABTesting = (
  req: Request,
  config: Configuration,
  tests: ABTest[],
): [ABTesting, ABTestAPI] => {
  const mvtId = getMvtId(req, config);
  const forcedTestVariants = getABForcedVariants(req);

  const abTestAPI = abTestApiForMvtId(mvtId, forcedTestVariants);

  const runnableTests = abTestAPI.allRunnableTests(tests);

  // Explicit notation needed due to TS Bug: https://github.com/microsoft/TypeScript/issues/36390
  // Should be removable as of TS 4.2
  const participations = (runnableTests as Runnable[]).map((test: Runnable) => {
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
