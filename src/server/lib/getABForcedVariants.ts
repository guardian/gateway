import qs from 'query-string';
import { Request } from 'express';
import { Participations } from '@guardian/ab-core';

const TEST_PREFIX = 'ab-';

// get forced test variants
// need to be in { [key: string]: { variant: string } }; type (Participations)
export const getABForcedVariants = (req: Request): Participations => {
  const query = qs.parseUrl(req.url).query;
  const forcedTestVariants: Participations = {};
  Object.entries(query).forEach(([key, value]) => {
    if (key.startsWith(TEST_PREFIX)) {
      const v = Array.isArray(value) ? value[value.length - 1] : value;
      forcedTestVariants[key.replace(TEST_PREFIX, '')] = {
        variant: v as string,
      };
    }
  });
  return forcedTestVariants;
};
