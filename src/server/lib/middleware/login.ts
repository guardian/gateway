import { NextFunction, Request } from 'express';
import { joinUrl } from '@guardian/libs';
import { read } from '@/server/lib/idapi/auth';
import { IDAPIAuthRedirect, IDAPIAuthStatus } from '@/shared/model/IDAPIAuth';
import { getProfileUrl } from '@/server/lib/getProfileUrl';
import { Routes } from '@/shared/model/Routes';
import { trackMetric } from '@/server/lib/trackMetric';
import { Metrics } from '@/server/models/Metrics';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { logger } from '@/server/lib/logger';
import { addQueryParamsToUntypedPath } from '@/shared/lib/queryParams';
import { ResponseWithRequestState } from '@/server/models/Express';
import { buildUrl } from '@/shared/lib/routeUtils';

const profileUrl = getProfileUrl();

export const loginMiddleware = async (
  req: Request,
  res: ResponseWithRequestState,
  next: NextFunction,
) => {
  const config = getConfiguration();
  const LOGIN_REDIRECT_URL = config.signInPageUrl;

  const redirectAuth = (auth: IDAPIAuthRedirect) => {
    if (auth.redirect) {
      const redirect = addQueryParamsToUntypedPath(auth.redirect.url, {
        ...res.locals.queryParams,
        returnUrl: joinUrl(profileUrl, req.path),
      });
      return res.redirect(redirect);
    }

    return res.redirect(
      addQueryParamsToUntypedPath(LOGIN_REDIRECT_URL, {
        ...res.locals.queryParams,
        returnUrl: joinUrl(profileUrl, req.path),
      }),
    );
  };

  const sc_gu_u = req.cookies.SC_GU_U;
  const sc_gu_la = req.cookies.SC_GU_LA;

  if (!sc_gu_u || !sc_gu_la) {
    res.redirect(
      addQueryParamsToUntypedPath(LOGIN_REDIRECT_URL, {
        ...res.locals.queryParams,
        returnUrl: joinUrl(profileUrl, req.path),
      }),
    );
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
      return res.redirect(303, buildUrl(Routes.VERIFY_EMAIL));
    }

    if (auth.status === IDAPIAuthStatus.RECENT) {
      trackMetric(Metrics.LOGIN_MIDDLEWARE_SUCCESS);
      next();
    } else {
      trackMetric(Metrics.LOGIN_MIDDLEWARE_NOT_RECENT);
      return redirectAuth(auth);
    }
  } catch (e) {
    logger.error('loginMiddlewareFailure', e);
    trackMetric(Metrics.LOGIN_MIDDLEWARE_FAILURE);
    res.redirect(
      addQueryParamsToUntypedPath(
        LOGIN_REDIRECT_URL,
        {
          ...res.locals.queryParams,
          returnUrl: joinUrl(profileUrl, req.path),
        },
        {
          error: 'signin-error-bad-request',
        },
      ),
    );
  }
};
