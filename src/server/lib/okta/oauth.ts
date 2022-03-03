import { ResponseWithRequestState } from '@/server/models/Express';
import { getPersistableQueryParams } from '@/shared/lib/queryParams';
import { RoutePaths } from '@/shared/model/Routes';
import {
  generateAuthorizationState,
  setAuthorizationStateCookie,
  ProfileOpenIdClient,
} from '@/server/lib/okta/openid-connect';

/**
 * Method to perform the Authorization Code Flow
 * for a) the sign in session check
 * and b) post authentication (with the session token)
 * @param res - the express response object
 * @param sessionToken (optional) - if provided, we'll use this to set the session cookie
 * @param confirmationPagePath (optional) - page to redirect the user to after authentication
 * @returns 303 redirect to the okta /authorize endpoint
 */
export const performAuthorizationCodeFlow = (
  res: ResponseWithRequestState,
  sessionToken?: string,
  confirmationPagePath?: RoutePaths,
) => {
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
  const authorizeUrl = ProfileOpenIdClient.authorizationUrl({
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
  });

  // redirect the user to the /authorize endpoint
  return res.redirect(303, authorizeUrl);
};
