import { Request, Router } from 'express';
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

const router = Router();

router.get(Routes.SIGN_IN, (req: Request, res: ResponseWithRequestState) => {
  const html = renderer(Routes.SIGN_IN, {
    requestState: res.locals,
    pageTitle: PageTitle.SIGN_IN,
  });
  res.type('html').send(html);
});

router.get(
  Routes.SIGN_IN_CURRENT,
  (req: Request, res: ResponseWithRequestState) => {
    const html = renderer(Routes.SIGN_IN_CURRENT, {
      requestState: res.locals,
      pageTitle: PageTitle.SIGN_IN,
    });
    res.type('html').send(html);
  },
);

router.post(
  Routes.SIGN_IN,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;

    const { email = '' } = req.body;
    const { password = '' } = req.body;

    const { returnUrl } = state.pageData;

    const { defaultReturnUri } = getConfiguration();

    try {
      const cookies = await authenticate(email, password, req.ip);

      setIDAPICookies(res, cookies);
    } catch (error) {
      const { message, status } = error;
      logger.error(error);

      trackMetric(Metrics.SIGN_IN_FAILURE);

      state = {
        ...state,
        globalMessage: {
          ...state.globalMessage,
          error: message,
        },
      };

      const html = renderer(Routes.SIGN_IN, {
        requestState: state,
        pageTitle: PageTitle.SIGN_IN,
      });
      return res.status(status).type('html').send(html);
    }

    trackMetric(Metrics.SIGN_IN_SUCCESS);

    return res.redirect(303, returnUrl || defaultReturnUri);
  }),
);

export default router;
