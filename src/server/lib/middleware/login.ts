import { NextFunction, Request } from 'express';
import { joinUrl } from '@guardian/libs';
import { read } from '@/server/lib/idapi/auth';
import { IDAPIAuthRedirect, IDAPIAuthStatus } from '@/shared/model/IDAPIAuth';
import { getProfileUrl } from '@/server/lib/getProfileUrl';

import { trackMetric } from '@/server/lib/trackMetric';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { logger } from '@/server/lib/serverSideLogger';
import { addQueryParamsToUntypedPath } from '@/shared/lib/queryParams';
import { ResponseWithRequestState } from '@/server/models/Express';
import { buildUrl } from '@/shared/lib/routeUtils';

const profileUrl = getProfileUrl();

export const loginMiddleware = async (
  req: Request,
  res: ResponseWithRequestState,
  next: NextFunction,
) => {
  const { signInPageUrl: LOGIN_REDIRECT_URL } = getConfiguration();

  const redirectAuth = (auth: IDAPIAuthRedirect) => {
    if (auth.redirect) {
      const redirect = addQueryParamsToUntypedPath(auth.redirect.url, {
        ...res.locals.queryParams,
        returnUrl: joinUrl(profileUrl, req.path),
      });
      return res.redirect(303, redirect);
    }

    return res.redirect(
      303,
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
      303,
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
      trackMetric('LoginMiddlewareNotSignedIn');
      return redirectAuth(auth);
    }

    if (!auth.emailValidated) {
      trackMetric('LoginMiddlewareUnverified');
      return res.redirect(303, buildUrl('/verify-email'));
    }

    if (auth.status === IDAPIAuthStatus.RECENT) {
      trackMetric('LoginMiddleware::Success');
      next();
    } else {
      trackMetric('LoginMiddlewareNotRecent');
      return redirectAuth(auth);
    }
  } catch (e) {
    logger.error('loginMiddlewareFailure', e);
    trackMetric('LoginMiddleware::Failure');
    res.redirect(
      303,
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
