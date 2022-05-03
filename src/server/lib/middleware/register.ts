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

export const registerMiddleware = async (
  req: Request,
  res: ResponseWithRequestState,
  next: NextFunction,
) => {
  const { okta, accountManagementUrl } = getConfiguration();

  const { useOkta } = res.locals.queryParams;

  const oktaSessionCookieId: string | undefined = req.cookies.sid;

  const identitySessionCookie = req.cookies.SC_GU_U;
  const identityLastAccessCookie = req.cookies.SC_GU_LA;

  // Check if the user has an existing Okta session. If they do and it's valid,
  // they're already logged in and are redirected to the account management
  // page. If the session isn't valid, they are redirected to the register
  // page.
  if (okta.enabled && useOkta && oktaSessionCookieId) {
    try {
      await getSession(oktaSessionCookieId);
      return res.redirect(accountManagementUrl);
    } catch {
      //if the cookie exists, but the session is invalid, we remove the cookie
      clearOktaCookies(res);
      logger.info(
        'User attempting to register had an existing Okta session cookie, but it was invalid',
      );
      //we redirect to /register to make sure the Okta sid cookie has been removed
      return res.redirect(
        addQueryParamsToPath('/register', res.locals.queryParams),
      );
    }
  } else if (
    identitySessionCookie &&
    identityLastAccessCookie &&
    !okta.enabled
    // we only want to check for identity cookies if okta is not enabled, this is to support apps,
    // who are using the Okta SDK logout, which does not remove Identity cookies on sign out
  ) {
    logger.info('User attempting to register had existing IDAPI cookies set.');

    //Check if the current Identity session cookie is valid
    const auth = await read(
      identitySessionCookie,
      identityLastAccessCookie,
      req.ip,
    );
    //if the current session is valid redirect to manage.theguardian.com
    if (
      auth.status === IDAPIAuthStatus.RECENT ||
      auth.status === IDAPIAuthStatus.NOT_RECENT
    ) {
      return res.redirect(accountManagementUrl);
    } else {
      //otherwise the user has invalid session cookie, so we take them back to the /register page and delete the Identity cookies
      clearIDAPICookies(res);
      return res.redirect(
        addQueryParamsToPath('/register', res.locals.queryParams),
      );
    }
  } else {
    next();
  }
};
