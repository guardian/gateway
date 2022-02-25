import { Request } from 'express';
import { typedRouter as router } from '@/server/lib/typedRoutes';
import { ResponseWithRequestState } from '@/server/models/Express';
import { logout } from '@/server/lib/idapi/unauth';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { logger } from '@/server/lib/serverSideLogger';
import { getConfiguration } from '@/server/lib/getConfiguration';
import {
  clearIDAPICookies,
  setIDAPICookies,
} from '@/server/lib/idapi/IDAPICookies';
import { deleteAuthorizationStateCookie } from '../lib/okta/openid-connect';
import { clearEncryptedStateCookie } from '../lib/encryptedStateCookie';
import { trackMetric } from '../lib/trackMetric';

const { defaultReturnUri, baseUri } = getConfiguration();

const DotComCookies = [
  'gu_user_features_expiry',
  'gu_paying_member',
  'gu_recurring_contributor',
  'gu_digital_subscriber',
];

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

router.get(
  '/signout',
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const state = res.locals;
    const { returnUrl } = state.pageData;

    try {
      // get the SC_GU_U cookie here
      const sc_gu_u: string | undefined = req.cookies.SC_GU_U;

      // only attempt log out if we have a SC_GU_U cookie
      if (sc_gu_u) {
        // perform the logout and get back the GU_SO cookie
        const cookies = await logout(sc_gu_u, req.ip);

        // set the GU_SO cookie
        if (cookies) {
          setIDAPICookies(res, cookies);
        }

        trackMetric('SignOut::Success');
      }
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);
      trackMetric('SignOut::Failure');
    } finally {
      // we want to clear the IDAPI cookies anyway even if there was an
      // idapi error so that we don't prevent users from logging out on their
      // browser at least

      // clear the IDAPI cookies
      clearIDAPICookies(res);

      // clear dotcom cookies
      clearDotComCookies(res);

      // clear gateway specific cookies
      deleteAuthorizationStateCookie(res);
      clearEncryptedStateCookie(res);

      return res.redirect(303, returnUrl || defaultReturnUri);
    }
  }),
);

export default router.router;
