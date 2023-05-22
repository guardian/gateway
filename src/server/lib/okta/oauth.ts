import { Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { getPersistableQueryParams } from '@/shared/lib/queryParams';
import { RoutePaths } from '@/shared/model/Routes';
import {
  generateAuthorizationState,
  setAuthorizationStateCookie,
  getOpenIdClient,
} from '@/server/lib/okta/openid-connect';
import { closeSession } from './api/sessions';

/**
 * List of individual scopes that can be requested by gateway
 *
 * However use one of the following lists instead of selecting individually:
 * scopesForAuthentication or scopesForApplication
 */
export type Scopes =
  | 'openid'
  | 'profile'
  | 'email'
  | 'guardian.identity-api.cookies.create.self.secure'
  | 'guardian.members-data-api.read.self'
  | 'guardian.identity-api.newsletters.read.self'
  | 'guardian.identity-api.newsletters.update.self'
  | 'id_token.profile.profile';

/**
 * @name scopesForAuthentication
 * @description Scopes to use when performing authentication (e.g sign in, set password)
 */
export const scopesForAuthentication: Scopes[] = [
  'openid',
  'profile',
  'guardian.identity-api.cookies.create.self.secure',
  'guardian.members-data-api.read.self',
  'guardian.identity-api.newsletters.read.self',
];

/**
 * @name scopesForApplication
 * @description Scopes to use when performing application actions (e.g. onboarding flow, post sign in prompt)
 */
export const scopesForApplication: Scopes[] = [
  'openid',
  'profile',
  'email',
  'guardian.identity-api.newsletters.read.self',
  'guardian.identity-api.newsletters.update.self',
  'id_token.profile.profile',
];

/**
 * @param closeExistingSession (optional) - if true, we'll close any existing okta session before calling the authorization code flow
 * @param confirmationPagePath (optional) - page to redirect the user to after authentication
 * @param doNotSetLastAccessCookie (optional) - if true, does not update the SC_GU_LA cookie during update of Idapi cookies.  Default false.
 * @param idp (optional) - okta id of the social identity provider to use
 * @param prompt (optional) - if provided, we'll use this to set the prompt parameter, see https://developer.okta.com/docs/reference/api/oidc/#parameter-details for prompt parameter details, N.B `undefined` has a different meaning to `none`
 * @param redirectUri - the redirect uri to use for the /authorize endpoint
 * @param scopes (optional) - any scopes to use for the /authorize endpoint, defaults to ['openid']
 * @param sessionToken (optional) - if provided, we'll use this to set the session cookie
 */
interface PerformAuthorizationCodeFlowOptions {
  closeExistingSession?: boolean;
  confirmationPagePath?: RoutePaths;
  doNotSetLastAccessCookie?: boolean;
  idp?: string;
  prompt?: 'login' | 'none';
  redirectUri: string;
  scopes: Scopes[];
  sessionToken?: string | null;
}

/**
 * @name performAuthorizationCodeFlow
 * @description Helper method to perform the Authorization Code Flow
 *
 * Used for post authentication with the session token to set a session cookie.
 *
 * @param req - the express request object
 * @param res - the express response object
 * @param options - the options for the authorization code flow
 * @returns 303 redirect to the okta /authorize endpoint
 */
export const performAuthorizationCodeFlow = async (
  req: Request,
  res: ResponseWithRequestState,
  {
    sessionToken,
    confirmationPagePath,
    idp,
    closeExistingSession,
    doNotSetLastAccessCookie = false,
    prompt,
    scopes = ['openid'],
    redirectUri,
  }: PerformAuthorizationCodeFlowOptions,
) => {
  if (closeExistingSession) {
    const oktaSessionCookieId: string | undefined = req.cookies.sid;
    // clear existing okta session cookie if it exists
    if (oktaSessionCookieId) {
      await closeSession(oktaSessionCookieId);
    }
  }

  // Determine which OpenIdClient to use, in DEV we use the DevProfileIdClient, otherwise we use the ProfileOpenIdClient
  const OpenIdClient = getOpenIdClient(req);

  // firstly we generate and store a "state"
  // as a http only, secure, signed session cookie
  // which is a json object that contains a stateParam and the query params
  // the stateParam is used to protect against csrf
  const authState = generateAuthorizationState(
    getPersistableQueryParams(res.locals.queryParams),
    confirmationPagePath,
    doNotSetLastAccessCookie,
  );
  setAuthorizationStateCookie(authState, res);

  // generate the /authorize endpoint url which we'll redirect the user too
  const authorizeUrl = OpenIdClient.authorizationUrl({
    // Prompt for 'login' if the idp is provided to make sure the user sees
    // the social provider login page
    // otherwise we'll use the prompt parameter provided
    prompt: idp ? 'login' : prompt,
    // The sessionToken from authentication to exchange for session cookie
    sessionToken,
    // we send the generated stateParam as the state parameter
    state: authState.stateParam,
    // any scopes, by default the 'openid' scope is required
    scope: scopes.join(' '),
    // the redirect_uri is the url that we'll redirect the user to after
    redirect_uri: redirectUri,
    // the identity provider if doing social login
    idp,
  });

  // redirect the user to the /authorize endpoint
  return res.redirect(303, authorizeUrl);
};
