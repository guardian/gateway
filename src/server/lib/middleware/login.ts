import { NextFunction, Request, Response } from 'express';
import { read } from '@/server/lib/idapi/auth';
import { IDAPIAuthRedirect, IDAPIAuthStatus } from '@/shared/model/IDAPIAuth';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { getProfileUrl } from '@/server/lib/getProfileUrl';
import { Routes } from '@/shared/model/Routes';
import { trackMetric } from '@/server/lib/trackMetric';
import { Metrics } from '@/server/models/Metrics';

const profileUrl = getProfileUrl();

export const loginMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const config = getConfiguration();
  const LOGIN_REDIRECT_URL = config.signInPageUrl;

  const FATAL_ERROR_REDIRECT_URL = `${LOGIN_REDIRECT_URL}?error=signin-error-bad-request`;

  const generateRedirectUrl = (url: string): string => {
    const divider = url.includes('?') ? '&' : '?';
    return `${url}${divider}returnUrl=${encodeURIComponent(
      profileUrl + req.path,
    )}`;
  };

  const redirectAuth = (auth: IDAPIAuthRedirect) => {
    if (auth.redirect) {
      const redirect = generateRedirectUrl(auth.redirect.url);
      return res.redirect(redirect);
    }

    return res.redirect(generateRedirectUrl(LOGIN_REDIRECT_URL));
  };

  const sc_gu_u = req.cookies.SC_GU_U;
  const sc_gu_la = req.cookies.SC_GU_LA;

  if (!sc_gu_u || !sc_gu_la) {
    res.redirect(generateRedirectUrl(LOGIN_REDIRECT_URL));
    return;
  }

  try {
    const auth = await read(sc_gu_u, sc_gu_la, req.ip);

    if (auth.status === IDAPIAuthStatus.SIGNED_OUT) {
      trackMetric(Metrics.LOGIN_MIDDLEWARE_NOT_SIGNED_IN);
      return redirectAuth(auth);
    }

    if (!auth.emailValidated) {
      trackMetric(Metrics.LOGIN_MIDDLEWARE_UNVERIFIED);
      return res.redirect(303, Routes.VERIFY_EMAIL);
    }

    if (auth.status === IDAPIAuthStatus.RECENT) {
      trackMetric(Metrics.LOGIN_MIDDLEWARE_SUCCESS);
      next();
    } else {
      trackMetric(Metrics.LOGIN_MIDDLEWARE_NOT_RECENT);
      return redirectAuth(auth);
    }
  } catch (e) {
    trackMetric(Metrics.LOGIN_MIDDLEWARE_FAILURE);
    res.redirect(generateRedirectUrl(FATAL_ERROR_REDIRECT_URL));
  }
};
