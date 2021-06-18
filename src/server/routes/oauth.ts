import { Request, Router } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { Routes } from '@/shared/model/Routes';
import {
  checkAuthorizationStateNonce,
  getAuthorizationStateCookie,
} from '@/server/lib/okta/oidc';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { logger } from '@/server/lib/logger';
import { trackMetric } from '@/server/lib/AWS';
import { Metrics } from '@/server/models/Metrics';

const router = Router();

const { signInPageUrl, defaultReturnUri } = getConfiguration();

router.get(
  Routes.OAUTH_CALLBACK,
  (req: Request, res: ResponseWithRequestState) => {
    try {
      const authState = getAuthorizationStateCookie(req);

      if (!authState) {
        // no state! is this an attack? redirect to sign in
        trackMetric(Metrics.AUTHORIZATION_FAILURE);
        return res.redirect(signInPageUrl);
      }

      const isValidState = checkAuthorizationStateNonce(
        req.query.state as string,
        authState,
      );

      if (!isValidState) {
        // not a valid nonce from the state! is this an attack?
        // redirect to sign in
        trackMetric(Metrics.AUTHORIZATION_FAILURE);
        return res.redirect(signInPageUrl);
      }

      trackMetric(Metrics.AUTHORIZATION_SUCCESS);

      // return to url from state or default url
      return res.redirect(authState.returnUrl || defaultReturnUri);
    } catch (error) {
      logger.error(error);
      trackMetric(Metrics.AUTHORIZATION_ERROR);
      // huh, there's been an error here, redirect to sign in
      return res.redirect(signInPageUrl);
    }
  },
);

export default router;
