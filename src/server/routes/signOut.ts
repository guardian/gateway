import { Request } from 'express';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { ResponseWithRequestState } from '@/server/models/Express';
import { logoutFromIDAPI } from '@/server/lib/idapi/unauth';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { logger } from '@/server/lib/serverSideLogger';
import { getConfiguration } from '@/server/lib/getConfiguration';
import {
  clearIDAPICookies,
  setSignOutCookie,
} from '@/server/lib/idapi/IDAPICookies';
import { deleteAuthorizationStateCookie } from '@/server/lib/okta/openid-connect';
import { clearEncryptedStateCookie } from '@/server/lib/encryptedStateCookie';
import { trackMetric } from '@/server/lib/trackMetric';
import { clearUserSessions } from '@/server/lib/okta/api/users';
import { getSession } from '@/server/lib/okta/api/sessions';
import { deleteOAuthTokenCookie } from '@/server/lib/okta/tokens';

const { defaultReturnUri, baseUri } = getConfiguration();

// taken from https://github.com/guardian/frontend/blob/7d227003a16b9b7d9a2f571d4e23e8ed4f981a2c/static/src/javascripts/projects/common/modules/commercial/user-features.ts#L134
// dotcom expects these cookies to be cleared as part of signout
const DotComCookies = [
  'GU_AF1',
  'gu_user_features_expiry',
  'gu_paying_member',
  'gu_recurring_contributor',
  'gu_digital_subscriber',
  'gu_action_required_for',
  'gu_hide_support_messaging',
  'gu_one_off_contribution_date',
];

const OKTA_COOKIE_NAME = 'sid';

const clearDotComCookies = (res: ResponseWithRequestState) => {
  // the baseUri is profile.theguardian.com so we strip the 'profile' as the cookie domain should be .theguardian.com
  // we also remove the port after the ':' to make it work in localhost for development and testing
  const domain = `${baseUri.replace('profile.', '').split(':')[0]}`;
  DotComCookies.forEach((key) => {
    // we can't use res.clearCookie because we don't know the exact settings for these cookies
    // so we overwrite them with an empty string, and expire them immediately
    res.cookie(key, '', {
      domain,
      maxAge: 0, // set to 0 to expire cookie immediately, and clear these cookies
    });
  });
};

export const clearOktaCookies = (res: ResponseWithRequestState) => {
  // We do not set a domain attribute as doing this makes the hostOnly=false
  // and when the cookie is set by Okta, they do not specify a domain in the set-cookie header,
  // so the Okta sid cookie is consider hostOnly=true
  // https://www.appsecmonkey.com/blog/cookie-security#hostonly-property
  res.cookie(OKTA_COOKIE_NAME, '', {
    maxAge: 0,
  });
};

router.get(
  '/signout',
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const { returnUrl } = res.locals.queryParams;

    // We try the logout sequentially, as we need to log users out from Okta first,
    try {
      await signOutFromOkta(req, res);
    } catch (e) {
      logger.error('Error signing out from Okta', e);
    }

    // if the user has no Okta sid cookie, we will then try and log them out from IDAPI
    // the user will be in this state if they previously had their Okta cookie removed and got
    // redirected back to the /signout endpoint
    try {
      await signOutFromIDAPI(req, res);
    } catch (e) {
      logger.error('Error signing out from IDAPI', e);
    }

    // clear dotcom cookies
    clearDotComCookies(res);

    // clear gateway specific cookies
    deleteAuthorizationStateCookie(res);
    clearEncryptedStateCookie(res);

    // clear any active OAuth tokens should they exist
    deleteOAuthTokenCookie(res, 'GU_ACCESS_TOKEN');
    deleteOAuthTokenCookie(res, 'GU_ID_TOKEN');

    // set the GU_SO (sign out) cookie
    setSignOutCookie(res);

    return res.redirect(303, returnUrl || defaultReturnUri);
  }),
);

const signOutFromIDAPI = async (
  req: Request,
  res: ResponseWithRequestState,
): Promise<void> => {
  try {
    // get the SC_GU_U cookie here
    const sc_gu_u: string | undefined = req.cookies.SC_GU_U;

    // attempt log out from Identity if we have a SC_GU_U cookie
    if (sc_gu_u) {
      // perform the logout from IDAPI
      await logoutFromIDAPI(sc_gu_u, req.ip, res.locals.requestId);
    }

    trackMetric('SignOut::Success');
  } catch (error) {
    logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
      request_id: res.locals.requestId,
    });
    trackMetric('SignOut::Failure');
  } finally {
    // we want to clear the IDAPI cookies anyway even if there was an
    // idapi error so that we don't prevent users from logging out on their
    // browser at least

    // clear the IDAPI cookies
    clearIDAPICookies(res);
  }
};

const signOutFromOkta = async (
  req: Request,
  res: ResponseWithRequestState,
): Promise<void> => {
  try {
    // attempt to log out from Okta if we have Okta session cookie
    const oktaSessionCookieId: string | undefined = req.cookies.sid;

    if (oktaSessionCookieId) {
      const { userId } = await getSession(oktaSessionCookieId);
      await clearUserSessions(userId);
      trackMetric('OktaSignOut::Success');
    }
  } catch (error) {
    logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
      request_id: res.locals.requestId,
    });
    trackMetric('OktaSignOut::Failure');
  } finally {
    //clear okta cookie
    clearOktaCookies(res);
  }
};

export default router.router;
