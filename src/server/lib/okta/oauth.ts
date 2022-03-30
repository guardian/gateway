import { Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { getPersistableQueryParams } from '@/shared/lib/queryParams';
import { RoutePaths } from '@/shared/model/Routes';
import {
  generateAuthorizationState,
  setAuthorizationStateCookie,
  ProfileOpenIdClient,
  ProfileOpenIdClientRedirectUris,
  DevProfileIdClient,
} from '@/server/lib/okta/openid-connect';
import { getConfiguration } from '../getConfiguration';

const { stage } = getConfiguration();

/**
 * @name performAuthorizationCodeFlow
 * @description Helper method to perform the Authorization Code Flow
 *
 * Used for post authentication with the session token to set a session cookie.
 *
 * @param res - the express response object
 * @param sessionToken (optional) - if provided, we'll use this to set the session cookie
 * @param confirmationPagePath (optional) - page to redirect the user to after authentication
 * @returns 303 redirect to the okta /authorize endpoint
 */
export const performAuthorizationCodeFlow = (
  req: Request,
  res: ResponseWithRequestState,
  sessionToken?: string,
  confirmationPagePath?: RoutePaths,
) => {
  // Determine which OpenIdClient to use, in DEV we use the DevProfileIdClient, otherwise we use the ProfileOpenIdClient
  const OpenIdClient =
    stage === 'DEV' && req.get('X-GU-Okta-Env')
      ? DevProfileIdClient(req.get('X-GU-Okta-Env') as string)
      : ProfileOpenIdClient;

  // firstly we generate and store a "state"
  // as a http only, secure, signed session cookie
  // which is a json object that contains a stateParam and the query params
  // the stateParam is used to protect against csrf
  const authState = generateAuthorizationState(
    getPersistableQueryParams(res.locals.queryParams),
    confirmationPagePath,
  );
  setAuthorizationStateCookie(authState, res);

  // generate the /authorize endpoint url which we'll redirect the user too
  const authorizeUrl = OpenIdClient.authorizationUrl({
    // Don't prompt for authentication or consent
    prompt: 'none',
    // The sessionToken from authentication to exchange for session cookie
    sessionToken,
    // we send the generated stateParam as the state parameter
    state: authState.stateParam,
    // any scopes, by default the 'openid' scope is required
    // the idapi_token_cookie_exchange scope is checked on IDAPI to return
    // idapi cookies on authentication
    scope: 'openid idapi_token_cookie_exchange',
    // the redirect_uri is the url that we'll redirect the user to after
    redirect_uri: ProfileOpenIdClientRedirectUris.WEB,
  });

  console.log(authorizeUrl);

  // redirect the user to the /authorize endpoint
  return res.redirect(303, authorizeUrl);
};
