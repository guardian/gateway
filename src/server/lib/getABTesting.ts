import type { ABTest, ABTestAPI, Runnable } from '@guardian/ab-core';
import type { Request } from 'express';
import type { ABTesting } from '@/server/models/Express';
import { abTestApiForMvtId } from '@/shared/model/experiments/abTests';
import { getABForcedVariants } from './getABForcedVariants';
import { getMvtId } from './getMvtId';

export const getABTesting = (
	req: Request,
	tests: ABTest[],
): [ABTesting, ABTestAPI] => {
	const mvtId = getMvtId(req);
	const forcedTestVariants = getABForcedVariants(req);

	const abTestAPI = abTestApiForMvtId(mvtId, forcedTestVariants);

	const runnableTests = abTestAPI.allRunnableTests(tests);

	const participations = runnableTests.map((test: Runnable<ABTest>) => {
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
