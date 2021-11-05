import { stringify } from 'query-string';
import {
  QueryParams,
  SafeQueryParams,
  UnsafeQueryParams,
} from '@/shared/model/QueryParams';

export const getSafeQueryParams = (params: QueryParams): SafeQueryParams => ({
  returnUrl: params.returnUrl,
  clientId: params.clientId,
  ref: params.ref,
  refViewId: params.refViewId,
});

export const addQueryParamsToPath = (
  path: string,
  params: QueryParams,
  unsafeParams?: UnsafeQueryParams,
): string => {
  const divider = path.includes('?') ? '&' : '?';
  const safeQueryString = stringify(getSafeQueryParams(params), {
    skipNull: true,
    skipEmptyString: true,
  });
  const unsafeQueryString = stringify(unsafeParams || {}, {
    skipNull: true,
    skipEmptyString: true,
  });
  return `${path}${divider}${safeQueryString}${
    unsafeQueryString ? `&${unsafeQueryString}` : ''
  }`;
};
