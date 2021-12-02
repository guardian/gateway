/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { IdApiQueryParams } from '../model/IdapiQueryParams';
import { QueryParams } from '../model/QueryParams';
import { AllRoutes } from '../model/Routes';
import {
  addApiQueryParamsToPath,
  addQueryParamsToUntypedPath,
} from './queryParams';

/**
 * ExtractRouteParams type generates a object type definition given a path type string
 * @example
 * given the string type '/a/:first/:last'
 * would create a type definition
 * type { first: string, last: string }
 */

export type ExtractRouteParams<T> = string extends T
  ? Record<string, string>
  : T extends `${infer _Start}:${infer Param}/${infer Rest}`
  ? { [k in Param | keyof ExtractRouteParams<Rest>]: string }
  : T extends `${infer _Start}:${infer Param}`
  ? { [k in Param]: string }
  : {};

/**
 * Object which has matching parameter keys for a path.
 * @example
 * a string type of '/a/:first/:last'
 * would require an object { first: "value", last: "value" } for token substitution
 */

export type PathParams<P extends AllRoutes> = ExtractRouteParams<P>;

export type BuildUrl = <P extends AllRoutes>(
  path: P,
  params?: ExtractRouteParams<P>,
) => string;
/**
 * Build an url with a path and its parameters.
 * @example
 * buildUrl(
 *   '/a/:first/:last',
 *   { first: 'p', last: 'q' },
 * ) // returns '/a/p/q'
 * @param path target path.
 * @param params parameters.
 */
export const buildUrl: BuildUrl = <P extends AllRoutes>(
  path: P,
  params: PathParams<P> = <PathParams<P>>{},
): string => {
  // //Upcast `params` to be used in string replacement.
  const paramObj: { [i: string]: string } = params;

  return Object.keys(paramObj).reduce((fullPath, key) => {
    return fullPath.replace(`:${key}`, paramObj[key]);
  }, path);
};

/**
 * Build an Gateway url with a path and its parameters.
 * @param path target path.
 * @param params parameters.
 * @param queryParams QueryParams
 */
export const buildUrlWithQueryParams = <P extends AllRoutes>(
  path: P,
  params: PathParams<P> = <PathParams<P>>{},
  queryParams: QueryParams,
): string => {
  const url = buildUrl(path, params);
  return addQueryParamsToUntypedPath(url, queryParams);
};

/**
 * Build an API url with a path and its parameters.
 * @param path target path.
 * @param params parameters.
 * @param queryParams IdApiQueryParams
 */
export const buildApiUrlWithQueryParams = <P extends AllRoutes>(
  path: P,
  params: PathParams<P> = <PathParams<P>>{},
  queryParams: IdApiQueryParams,
): string => {
  const url = buildUrl(path, params);
  return addApiQueryParamsToPath(url, queryParams);
};
