import { stringify } from 'query-string';
import {
  QueryParams,
  PersistableQueryParams,
} from '@/shared/model/QueryParams';

export const getPersistableQueryParams = (
  params: QueryParams,
): PersistableQueryParams => ({
  returnUrl: params.returnUrl,
  clientId: params.clientId,
  ref: params.ref,
  refViewId: params.refViewId,
  sessionToken: params.sessionToken,
  useOkta: params.useOkta,
});

export const addQueryParamsToPath = (
  path: string,
  params: QueryParams,
  overrides?: Partial<QueryParams>,
): string => {
  const divider = path.includes('?') ? '&' : '?';
  const queryString = stringify(
    { ...getPersistableQueryParams(params), ...overrides },
    {
      skipNull: true,
      skipEmptyString: true,
    },
  );
  return `${path}${divider}${queryString}`;
};
