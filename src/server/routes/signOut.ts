import { Request } from 'express';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { ResponseWithRequestState } from '@/server/models/Express';
import { logoutFromIDAPI } from '@/server/lib/idapi/unauth';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { logger } from '@/server/lib/serverSideLogger';
import { getConfiguration } from '@/server/lib/getConfiguration';
import {
  clearIDAPICookies,
  setIDAPICookies,
} from '@/server/lib/idapi/IDAPICookies';
import { deleteAuthorizationStateCookie } from '@/server/lib/okta/openid-connect';
import { clearEncryptedStateCookie } from '@/server/lib/encryptedStateCookie';
import { trackMetric } from '@/server/lib/trackMetric';
import { clearUserSessions } from '@/server/lib/okta/api/users';
import { getSession } from '@/server/lib/okta/api/sessions';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';

const { defaultReturnUri, baseUri } = getConfiguration();

const DotComCookies = [
  'gu_user_features_expiry',
  'gu_paying_member',
  'gu_recurring_contributor',
  'gu_digital_subscriber',
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
    const { returnUrl } = res.locals.pageData;

    // We try the logout sequentially, as we need to log users out from Okta first,
    const oktaSessionCookieId: string | undefined = req.cookies.sid;

    if (oktaSessionCookieId) {
      await signOutFromOkta(req, res);
      // We try and remove their session and then unset their sid cookie by redirecting back to /signout
      // this keeps them on the profile domain to remove the Okta cookies
      return res.redirect(
        addQueryParamsToPath('/signout', res.locals.queryParams),
      );
    } else {
      // if the user has no Okta sid cookie, we will then try and log them out from IDAPI
      // the user will be in this state if they previously had their Okta cookie removed and got
      // redirected back to the /signout endpoint
      await signOutFromIDAPI(req, res);
      // clear dotcom cookies
      clearDotComCookies(res);

      // clear gateway specific cookies
      deleteAuthorizationStateCookie(res);
      clearEncryptedStateCookie(res);

      return res.redirect(303, returnUrl || defaultReturnUri);
    }
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
      // perform the logout and get back the GU_SO cookie
      const cookies = await logoutFromIDAPI(sc_gu_u, req.ip);

      // set the GU_SO cookie
      if (cookies) {
        setIDAPICookies(res, cookies);
      }
    }

    trackMetric('SignOut::Success');
  } catch (error) {
    logger.error(`${req.method} ${req.originalUrl}  Error`, error);
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
    }
  } catch (error) {
    logger.error(`${req.method} ${req.originalUrl}  Error`, error);
    trackMetric('OktaSignOut::Failure');
  } finally {
    //clear okta cookie
    clearOktaCookies(res);
  }
};

export default router.router;
