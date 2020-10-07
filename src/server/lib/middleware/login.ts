import { NextFunction, Request, Response } from 'express';
import { read } from '@/server/lib/idapi/auth';
import { IDAPIAuthStatus } from '@/shared/model/IDAPIAuth';
import { getConfiguration } from '@/server/lib/configuration';
import { getProfileUrl } from '../baseUri';
import { Routes } from '@/shared/model/Routes';

const profileUrl = getProfileUrl();

export const loginMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const config = getConfiguration();
  const LOGIN_REDIRECT_URL = config.signInPageUrl;

  const FATAL_ERROR_REDIRECT_URL = `${LOGIN_REDIRECT_URL}/signin?error=signin-error-bad-request`;

  const generateRedirectUrl = (url: string): string => {
    const divider = url.includes('?') ? '&' : '?';
    return `${url}${divider}returnUrl=${encodeURIComponent(
      profileUrl + req.path,
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

    if (!auth.emailValidated) {
      return res.redirect(303, Routes.VERIFY_EMAIL);
    }

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
    res.redirect(generateRedirectUrl(FATAL_ERROR_REDIRECT_URL));
  }
};
