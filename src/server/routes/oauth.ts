import { Request, Router } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { Routes } from '@/shared/model/Routes';
import {
  deleteAuthorizationStateCookie,
  getAuthorizationStateCookie,
  OktaOIDC,
} from '@/server/lib/okta/oidc';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { logger } from '@/server/lib/logger';
import { trackMetric } from '@/server/lib/AWS';
import { Metrics } from '@/server/models/Metrics';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { exchangeAccessTokenForCookies } from '@/server/lib/idapi/auth';
import { setIDAPICookies } from '@/server/lib/setIDAPICookies';

const router = Router();

const { signInPageUrl, defaultReturnUri } = getConfiguration();

router.get(
  Routes.OAUTH_AUTH_CODE_CALLBACK,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    try {
      // params returned from the /authorize endpoint
      // for auth code flow they will be "code" and "state"
      // "code" is the authorization code to exchange for access token
      // "state" will be the "nonce" value set in the oidc_auth_state cookie
      const callbackParams = OktaOIDC.Client.callbackParams(req);

      // get the oidc_auth_state cookie which contains the "nonce"
      // and "returnUrl" so we can get the user back to the page they
      // initially landed on sign in from
      const authState = getAuthorizationStateCookie(req);

      // check if the state cookie exists
      if (!authState) {
        // no state! is this an attack?
        // redirect to sign in and cancel flow
        trackMetric(Metrics.AUTHORIZATION_FAILURE);
        return res.redirect(signInPageUrl);
      }

      // we have the Authorization State now, so the cookie is
      // no longer required, so mark cookie for deletion in the response
      deleteAuthorizationStateCookie(res);

      // exchange the auth code for access token + id token
      // and check the "state" we got back from the callback
      // to the "nonce" that was set in the AuthorizationState
      const tokenSet = await OktaOIDC.Client.oauthCallback(
        // the redirectUri is the callback location (this route)
        OktaOIDC.Client.metadata.redirect_uris?.[0],
        // the params sent to the callback
        callbackParams,
        // checks to make sure that everything is valid
        {
          // we're doing the auth code flow, so check for the correct type
          response_type: 'code',
          // check that the nonce is the same
          state: authState.nonce,
        },
      );

      // call the IDAPI /auth/oauth-token endpoint
      // to exchange the access token for identity cookies
      // the idapi introspects the access token and if valid
      // will generate and sign cookies for the user the
      // token belonged to
      const cookies = await exchangeAccessTokenForCookies(
        tokenSet.access_token || '',
        req.ip,
      );

      // adds set cookie headers
      setIDAPICookies(res, cookies);

      trackMetric(Metrics.AUTHORIZATION_SUCCESS);

      // return to url from state or default url
      return res.redirect(authState.returnUrl || defaultReturnUri);
    } catch (error) {
      logger.error(error);
      trackMetric(Metrics.AUTHORIZATION_ERROR);
      // huh, there's been an error here, redirect to sign in
      return res.redirect(signInPageUrl);
    }
  }),
);

export default router;
