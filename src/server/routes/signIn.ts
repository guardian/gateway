import { Request } from 'express';
import deepmerge from 'deepmerge';
import { authenticate } from '@/server/lib/idapi/auth';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { Routes } from '@/shared/model/Routes';
import { ResponseWithRequestState } from '@/server/models/Express';
import { trackMetric } from '@/server/lib/trackMetric';
import { Metrics } from '@/server/models/Metrics';
import { PageTitle } from '@/shared/model/PageTitle';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { setIDAPICookies } from '@/server/lib/setIDAPICookies';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { decrypt } from '@/server/lib/idapi/decryptToken';
import { FederationErrors, SignInErrors } from '@/shared/model/Errors';
import { ApiError } from '@/server/models/Error';
import { RoutePathsAll } from '@/shared/lib/routeUtils';
import { typedRouter as router } from '@/server/lib/typedRoutes';

const preFillEmailField = (route: RoutePathsAll) =>
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const state = res.locals;
    const { encryptedEmail, error } = state.queryParams;
    const email = encryptedEmail ? await decrypt(encryptedEmail, req.ip) : '';
    const errorMessage =
      error === FederationErrors.SOCIAL_SIGNIN_BLOCKED
        ? SignInErrors.ACCOUNT_ALREADY_EXISTS
        : '';

    const html = renderer(route, {
      requestState: deepmerge(state, {
        pageData: {
          email: email,
        },
        globalMessage: {
          error: errorMessage,
        },
      }),
      pageTitle: PageTitle.SIGN_IN,
    });
    res.type('html').send(html);
  });

router.get(Routes.SIGN_IN, preFillEmailField(Routes.SIGN_IN));

router.post(
  Routes.SIGN_IN,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const state = res.locals;

    const { email = '' } = req.body;
    const { password = '' } = req.body;

    const { returnUrl } = state.pageData;

    const { defaultReturnUri } = getConfiguration();

    try {
      const cookies = await authenticate(email, password, req.ip);

      setIDAPICookies(res, cookies);
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);
      const { message, status } =
        error instanceof ApiError ? error : new ApiError();

      trackMetric(Metrics.SIGN_IN_FAILURE);

      // re-render the sign in page on error
      const html = renderer(Routes.SIGN_IN, {
        requestState: deepmerge(res.locals, {
          globalMessage: {
            error: message,
          },
        }),
        pageTitle: PageTitle.SIGN_IN,
      });

      return res.status(status).type('html').send(html);
    }

    trackMetric(Metrics.SIGN_IN_SUCCESS);

    return res.redirect(303, returnUrl || defaultReturnUri);
  }),
);

export default router.router;
