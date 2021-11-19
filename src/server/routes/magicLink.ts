import { Router, Request } from 'express';
import deepmerge from 'deepmerge';
import { Routes } from '@/shared/model/Routes';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { trackMetric } from '@/server/lib/trackMetric';
import { Metrics } from '@/server/models/Metrics';
import { PageTitle } from '@/shared/model/PageTitle';
import { ResponseWithRequestState } from '@/server/models/Express';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { ApiError } from '@/server/models/Error';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { RecaptchaV2 } from 'express-recaptcha';
import { CaptchaErrors } from '@/shared/model/Errors';

const router = Router();

const {
  googleRecaptcha: { secretKey, siteKey },
} = getConfiguration();

// set google recaptcha site key
const recaptcha = new RecaptchaV2(siteKey, secretKey);

router.get(Routes.MAGIC_LINK, (req: Request, res: ResponseWithRequestState) => {
  const html = renderer(Routes.MAGIC_LINK, {
    requestState: res.locals,
    pageTitle: PageTitle.MAGIC_LINK,
  });
  res.type('html').send(html);
});

router.post(
  Routes.MAGIC_LINK,
  recaptcha.middleware.verify,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;

    const { email = '' } = req.body;

    try {
      if (req.recaptcha?.error) {
        logger.error(
          'Problem verifying recaptcha, error response: ',
          req.recaptcha.error,
        );
        throw new ApiError({
          message: CaptchaErrors.GENERIC,
          status: 400,
        });
      }

      console.log(
        `TODO: Implement the logic to send the magic link to ${email} here`,
      );
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);
      const { message, status } =
        error instanceof ApiError ? error : new ApiError();

      trackMetric(Metrics.SEND_MAGIC_LINK_FAILURE);

      state = deepmerge(state, {
        globalMessage: {
          error: message,
        },
      });

      const html = renderer(Routes.MAGIC_LINK, {
        requestState: state,
        pageTitle: PageTitle.MAGIC_LINK,
      });
      return res.status(status).type('html').send(html);
    }

    trackMetric(Metrics.SEND_MAGIC_LINK_SUCCESS);

    return res.redirect(303, `${Routes.MAGIC_LINK}${Routes.EMAIL_SENT}`);
  }),
);

router.get(
  `${Routes.MAGIC_LINK}${Routes.EMAIL_SENT}`,
  (_: Request, res: ResponseWithRequestState) => {
    const html = renderer(`${Routes.MAGIC_LINK}${Routes.EMAIL_SENT}`, {
      pageTitle: PageTitle.MAGIC_LINK,
      requestState: res.locals,
    });
    res.type('html').send(html);
  },
);

export default router;
