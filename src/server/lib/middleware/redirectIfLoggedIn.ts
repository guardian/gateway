import { NextFunction, Request } from 'express';
import { getSession } from '../okta/api/sessions';
import { clearOktaCookies } from '@/server/routes/signOut';
import { logger } from '../serverSideLogger';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { ResponseWithRequestState } from '@/server/models/Express';
import { getConfiguration } from '../getConfiguration';
import { read } from '../idapi/auth';
import { IDAPIAuthStatus } from '@/shared/model/IDAPIAuth';
import { clearIDAPICookies } from '../idapi/IDAPICookies';
const { okta, defaultReturnUri } = getConfiguration();

/** Middleware function which will redirect the client to the base Guardian
 * domain if a valid logged in session is found. Currently checks both IDAPI and
 * Okta session validity.
 */
export const redirectIfLoggedIn = async (
  req: Request,
  res: ResponseWithRequestState,
  next: NextFunction,
) => {
  const { useOkta } = res.locals.queryParams;

  const oktaSessionCookieId: string | undefined = req.cookies.sid;

  const identitySessionCookie = req.cookies.SC_GU_U;
  const identityLastAccessCookie = req.cookies.SC_GU_LA;

  // Check if the user has an existing Okta session. If they do and it's valid,
  // they're already logged in and are redirected to the logged in redirect URL.
  if (okta.enabled && useOkta && oktaSessionCookieId) {
    try {
      await getSession(oktaSessionCookieId);
      return res.redirect(defaultReturnUri);
    } catch {
      //if the cookie exists, but the session is invalid, we remove the cookie
      clearOktaCookies(res);
      logger.info(
        'User attempting to access signed-out-only route had an existing Okta session cookie, but it was invalid',
      );
      //we redirect to /reauthenticate to make sure the Okta sid cookie has been removed
      return res.redirect(
        addQueryParamsToPath('/reauthenticate', res.locals.queryParams),
      );
    }
  } else {
    if (identitySessionCookie && identityLastAccessCookie) {
      logger.info(
        'User attempting to access signed-out-only route had existing IDAPI cookies set.',
      );
      try {
        //Check if the current Identity session cookie is valid
        const auth = await read(
          identitySessionCookie,
          identityLastAccessCookie,
          req.ip,
        );
        //if the current session is valid redirect to the chosen URL
        if (
          auth.status === IDAPIAuthStatus.RECENT ||
          auth.status === IDAPIAuthStatus.NOT_RECENT
        ) {
          return res.redirect(defaultReturnUri);
        } else {
          //otherwise the user has an invalid session cookie, so we take them back to
          // /reauthenticate and delete the Identity cookies
          clearIDAPICookies(res);
          return res.redirect(
            addQueryParamsToPath('/reauthenticate', res.locals.queryParams),
          );
        }
      } catch {
        // If we fail to get a response from Identity Api to check the users status,
        // we will redirect to the redirect URL
        return res.redirect(defaultReturnUri);
      }
    }
  }
  return next();
};
