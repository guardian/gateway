import { NextFunction, Request } from 'express';
import { getSession } from '../okta/api/sessions';
import { clearOktaCookies } from '@/server/routes/signOut';
import { logger } from '../serverSideLogger';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { ResponseWithRequestState } from '@/server/models/Express';
import { getConfiguration } from '../getConfiguration';

export const registerMiddleware = async (
  req: Request,
  res: ResponseWithRequestState,
  next: NextFunction,
) => {
  const RedirectIfOktaSessionExists = async (
    req: Request,
    res: ResponseWithRequestState,
  ) => {
    // Check if the user has an existing Okta session. If they do and it's valid,
    // they're already logged in and are redirected to the account management
    // page. If the session isn't valid, they are redirected to the register
    // page.
    const { useOkta } = res.locals.queryParams;
    const { okta } = getConfiguration();
    const oktaSessionCookieId: string | undefined = req.cookies.sid;

    if (okta.enabled && useOkta && oktaSessionCookieId) {
      try {
        await getSession(oktaSessionCookieId);
        return res.redirect('https://manage.theguardian.com/');
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
    } else {
      next();
    }
  };
  RedirectIfOktaSessionExists(req, res);
};
