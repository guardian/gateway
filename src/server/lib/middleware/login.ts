import { NextFunction, Request, Response } from 'express';
import { read } from '@/server/lib/idapi/auth';
import { IDAPIAuthStatus } from '@/shared/model/IDAPIAuth';
import { getConfiguration } from '@/server/lib/configuration';

export const loginMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const config = getConfiguration();
  const LOGIN_REDIRECT_URL = config.signInPageUrl;
  const RETURN_URL = config.baseUri + '/signin';

  const generateRedirectUrl = (url: string): string => {
    const divider = url.includes('?') ? '&' : '?';
    return `${url}/signin${divider}returnUrl=${encodeURIComponent(
      RETURN_URL + req.path,
    )}`;
  };

  const sc_gu_u = req.cookies.SC_GU_U;
  const sc_gu_la = req.cookies.SC_GU_LA;

  if (!sc_gu_u || !sc_gu_la) {
    res.redirect(generateRedirectUrl(LOGIN_REDIRECT_URL));
    return;
  }

  try {
    const auth = await read(sc_gu_u, sc_gu_la, req.ip);
    if (auth.status === IDAPIAuthStatus.RECENT) {
      next();
    } else {
      if (auth.redirect) {
        const redirect = generateRedirectUrl(auth.redirect.url);
        res.redirect(redirect);
        return;
      } else {
        res.redirect(generateRedirectUrl(LOGIN_REDIRECT_URL));
        return;
      }
    }
  } catch (e) {
    res.redirect(generateRedirectUrl(LOGIN_REDIRECT_URL));
  }
};
