import type { Participations } from '@guardian/ab-core';
import type { Request } from 'express';

const TEST_PREFIX = 'ab-';

// get forced test variants
// need to be in { [key: string]: { variant: string } }; type (Participations)
export const getABForcedVariants = (req: Request): Participations => {
	const forcedTestVariants = Object.entries(req.query)
		.filter(([key]) => key.startsWith(TEST_PREFIX))
		.map(([key, value]) => {
			const v = Array.isArray(value) ? value[value.length - 1] : value;
			return [
				key.replace(TEST_PREFIX, ''),
				{
					variant: v as string,
				},
			];
		});
	return Object.fromEntries(forcedTestVariants);
};
