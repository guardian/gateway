import qs from 'query-string';
import { Request } from 'express';
import { Participations } from '@guardian/ab-core';

const TEST_PREFIX = 'ab-';

// get forced test variants
// need to be in { [key: string]: { variant: string } }; type (Participations)
export const getABForcedVariants = (req: Request): Participations => {
  const query = qs.parseUrl(req.url).query;
  const forcedTestVariants = Object.entries(query)
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
