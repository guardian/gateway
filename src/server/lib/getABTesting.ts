import { ABTesting } from '@/server/models/Express';
import { Configuration } from '../models/Configuration';
import { getMvtId } from './getMvtId';
import { Request } from 'express';
import { getABForcedVariants } from './getABForcedVariants';
import { abTestApiForMvtId } from '@/shared/model/experiments/abTests';
import { ABTest, ABTestAPI } from '@guardian/ab-core';

export const getABTesting = (
  req: Request,
  config: Configuration,
  tests: ABTest[],
): [ABTesting, ABTestAPI] => {
  const abTesting: ABTesting = {
    mvtId: getMvtId(req, config),
    forcedTestVariants: getABForcedVariants(req),
    participations: {},
  };

  const abTestAPI = abTestApiForMvtId(
    abTesting.mvtId,
    abTesting.forcedTestVariants,
  );

  const runnableTests = abTestAPI.allRunnableTests(tests);

  runnableTests.forEach((test) => {
    abTesting.participations[test.id] = {
      variant: test.variantToRun.id,
    };
  });

  return [abTesting, abTestAPI];
};
