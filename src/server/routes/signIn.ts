import { Request, Router } from 'express';
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
import { RequestError } from '@/shared/lib/error';
import { decrypt } from '@/server/lib/idapi/decryptToken';

const router = Router();

const preFillEmailField = (route: string) =>
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const state = res.locals;
    const { encryptedEmail } = state.queryParams;
    const { email = '' } = encryptedEmail
      ? await decrypt(encryptedEmail, req.ip)
      : {};

    const html = renderer(route, {
      requestState: deepmerge(state, {
        pageData: {
          email: email,
        },
      }),
      pageTitle: PageTitle.SIGN_IN,
    });
    res.type('html').send(html);
  });

router.get(Routes.SIGN_IN, preFillEmailField(Routes.SIGN_IN));

router.get(Routes.SIGN_IN_CURRENT, preFillEmailField(Routes.SIGN_IN_CURRENT));

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
      const { message, status } = error as RequestError;

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

export default router;
