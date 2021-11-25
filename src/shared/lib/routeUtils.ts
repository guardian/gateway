/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * These are all the accepted url routes for this application
 * If you want to add a new route, it will need to be added below
 */
export type RoutePaths =
  | '/signin'
  | '/signin/complete'
  | '/register'
  | '/register/email-sent'
  | '/register/email-sent/resend'
  | '/register/resend'
  | '/reset'
  | '/reset/email-sent'
  | '/reset/complete'
  | '/reset-password'
  | '/reset-password/:token'
  | '/password/reset-confirmation'
  | '/reset/resend'
  | '/reset/expired'
  | '/set-password'
  | '/set-password/expired'
  | '/set-password/:token'
  | '/set-password/complete'
  | '/set-password/resend'
  | '/set-password/email-sent'
  | '/consents/data'
  | '/consents/communication'
  | '/consents/newsletters'
  | '/consents/review'
  | '/consents/:page'
  | '/consents'
  | '/welcome'
  | '/welcome/resend'
  | '/welcome/expired'
  | '/welcome/email-sent'
  | '/welcome/complete'
  | '/welcome/:token'
  | '/verify-email'
  | '/magic-link'
  | '/magic-link/email-sent'
  | '/error'
  | '/404';

/**
 * RoutePathsAll is the union of the above types
 */

export type RoutePathsAll = RoutePaths;

/**
 * These are all valid paths for the Identity API
 * New routes should be added below
 */
export type ApiRoutePaths =
  | '/pwd-reset/send-password-reset-email'
  | '/pwd-reset/user-for-token'
  | '/pwd-reset/reset-pwd-for-user'
  | '/user/validate-email'
  | '/user/send-validation-email'
  | '/signin-token/token'
  | '/auth'
  | '/redirect'
  | '/consents'
  | '/user'
  | '/users'
  | '/me'
  | '/type'
  | '/guest'
  | '/newsletters'
  | '/send-account-verification-email'
  | '/send-account-exists-email'
  | '/send-account-without-password-exists-email'
  | '/send-create-password-account-exists-email';

export type ValidUrl = string;
/**
 * This is all valid routes on the site, only used for the helper function addQueryParamsToPath
 */
export type AllRoutes = ApiRoutePaths | RoutePaths;

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
export const buildUrl = <P extends AllRoutes>(
  path: P,
  params: PathParams<P> = <PathParams<P>>{},
): ValidUrl => {
  // //Upcast `params` to be used in string replacement.
  const paramObj: { [i: string]: string } = params;

  return Object.keys(paramObj).reduce((fullPath, key) => {
    return fullPath.replace(`:${key}`, paramObj[key]);
  }, path);
};
