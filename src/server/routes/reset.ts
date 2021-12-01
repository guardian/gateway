import { Request } from 'express';
import deepmerge from 'deepmerge';
import { create as resetPassword } from '@/server/lib/idapi/resetPassword';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';

import { ResponseWithRequestState } from '@/server/models/Express';
import { trackMetric } from '@/server/lib/trackMetric';
import { Metrics } from '@/server/models/Metrics';
import { PageTitle } from '@/shared/model/PageTitle';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { readEmailCookie } from '@/server/lib/emailCookie';
import { setEncryptedStateCookie } from '../lib/encryptedStateCookie';
import { ResetPasswordErrors } from '@/shared/model/Errors';
import { ApiError } from '@/server/models/Error';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { typedRouter as router } from '@/server/lib/typedRoutes';
import handleRecaptcha from '@/server/lib/recaptcha';

router.get('/reset', (req: Request, res: ResponseWithRequestState) => {
  let state = res.locals;
  const email = readEmailCookie(req);

  if (email) {
    state = deepmerge(state, {
      pageData: {
        email,
      },
    });
  }

  const html = renderer('/reset', {
    requestState: state,
    pageTitle: PageTitle.RESET,
  });
  res.type('html').send(html);
});

router.post(
  '/reset',
  handleRecaptcha,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;

    const { email = '' } = req.body;

    const { returnUrl, emailSentSuccess } = res.locals.queryParams;

    try {
      await resetPassword(email, req.ip, returnUrl);

      setEncryptedStateCookie(res, { email });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);

      const { message, status } =
        error instanceof ApiError
          ? error
          : new ApiError({ message: ResetPasswordErrors.GENERIC });

      trackMetric(Metrics.SEND_PASSWORD_RESET_FAILURE);

      state = deepmerge(state, {
        globalMessage: {
          error: message,
        },
      });

      const html = renderer('/reset', {
        requestState: state,
        pageTitle: PageTitle.RESET,
      });
      return res.status(status).type('html').send(html);
    }

    trackMetric(Metrics.SEND_PASSWORD_RESET_SUCCESS);

    return res.redirect(
      303,
      addQueryParamsToPath('/reset/email-sent', res.locals.queryParams, {
        emailSentSuccess,
      }),
    );
  }),
);

router.get(
  '/reset/email-sent',
  (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;

    const email = readEmailCookie(req);

    state = deepmerge(state, {
      pageData: {
        email,
        previousPage: '/reset',
      },
    });

    const html = renderer('/reset/email-sent', {
      pageTitle: PageTitle.EMAIL_SENT,
      requestState: state,
    });
    res.type('html').send(html);
  },
);

export default router.router;
