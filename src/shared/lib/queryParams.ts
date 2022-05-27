import { stringify } from 'query-string';
import {
  QueryParams,
  PersistableQueryParams,
} from '@/shared/model/QueryParams';
import { IdApiQueryParams } from '../model/IdapiQueryParams';
import { AllRoutes } from '../model/Routes';

/**
 * @param params QueryParams object with all query parameters
 * @returns PersistableQueryParams - object with query parameters to persist between requests
 */
export const getPersistableQueryParams = (
  params: QueryParams,
): PersistableQueryParams => ({
  returnUrl: params.returnUrl,
  clientId: params.clientId,
  ref: params.ref,
  refViewId: params.refViewId,
  useOkta: params.useOkta,
  componentEventParams: params.componentEventParams,
  fromURI: params.fromURI,
  appClientId: params.appClientId,
});

/**
 * @param params QueryParams object with all query parameters
 * @returns PersistableQueryParams - object with query parameters to persist between requests but without the appClientId and fromURI params which are Okta specific
 */
export const getPersistableQueryParamsWithoutOktaParams = (
  params: QueryParams,
): PersistableQueryParams => {
  const persistableQueryParams = getPersistableQueryParams(params);
  // eslint-disable-next-line functional/immutable-data
  delete persistableQueryParams.appClientId;
  // eslint-disable-next-line functional/immutable-data
  delete persistableQueryParams.fromURI;
  return persistableQueryParams;
};

/**
 *
 * @param path a path segment of a url that is typed as part of RoutePaths
 * @param params QueryParams - any query params to be added to the path
 * @param overrides Any query parameter overrides
 * @returns string
 * This takes a non-typed url string and adds query parameters
 * This should only be used when you have a path that is dynamically generated ie from another input parameter
 * You should use addQueryParamsToPath for all typed internal application urls
 */

export const addQueryParamsToPath = (
  path: AllRoutes,
  params: QueryParams,
  overrides?: Partial<QueryParams>,
): string => {
  return addQueryParamsToUntypedPath(path, params, overrides);
};

/**
 *
 * @param path a path segment of a url that is not typed as part of RoutePaths
 * @param params QueryParams - any query params to be added to the path
 * @param overrides Any query parameter overrides
 * @returns string
 * This takes a non-typed url string and adds query parameters
 * This should only be used when you have a path that is dynamically generated ie from another input parameter
 * You should use addQueryParamsToPath for all typed internal application urls
 */

export const addQueryParamsToUntypedPath = (
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

/**
 *
 * @param path a path segment of a url
 * @param params QueryParams - any query params to be added to the path
 * @param overrides Any query parameter overrides
 * @returns string
 * addApiQueryParamsToPath is for adding query params to an API path
 * These parameters are not filtered, so this function is slighly different to addQueryParamsToUntypedPath
 */

export const addApiQueryParamsToPath = (
  path: string,
  params: IdApiQueryParams,
  overrides?: Partial<QueryParams>,
): string => {
  const divider = path.includes('?') ? '&' : '?';
  const queryString = stringify(
    { ...params, ...overrides },
    {
      skipNull: true,
      skipEmptyString: true,
    },
  );
  return `${path}${divider}${queryString}`;
};

/**
 *
 * @param params QueryParams - any query params to be added to the path
 * @param overrides Any query parameter overrides
 * @returns string
 * buildQueryParamsString is for building a Gateway compatabile query string
 * These parameters are are filtered, so only allowed parameters can be added.
 */

export const buildQueryParamsString = (
  params: QueryParams,
  overrides?: Partial<QueryParams>,
): string => {
  const queryString = stringify(
    { ...getPersistableQueryParams(params), ...overrides },
    {
      skipNull: true,
      skipEmptyString: true,
    },
  );
  return `?${queryString}`;
};
