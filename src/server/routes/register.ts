import { Request, Router } from 'express';
import { create } from '@/server/lib/idapi/user';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { Routes } from '@/shared/model/Routes';
import { ResponseWithRequestState } from '@/server/models/Express';
import { trackMetric } from '@/server/lib/AWS';
import { Metrics } from '@/server/models/Metrics';
import { PageTitle } from '@/shared/model/PageTitle';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
// import { setIDAPICookies } from '@/server/lib/setIDAPICookies';
import { getConfiguration } from '../lib/getConfiguration';

const router = Router();

router.get(
  Routes.REGISTRATION,
  (req: Request, res: ResponseWithRequestState) => {
    const html = renderer(Routes.REGISTRATION, {
      requestState: res.locals,
      pageTitle: PageTitle.REGISTRATION,
    });
    res.type('html').send(html);
  },
);

router.post(
  Routes.REGISTRATION,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;

    const { email = '' } = req.body;
    const { password = '' } = req.body;

    const { returnUrl } = state.pageData;

    const { defaultReturnUri } = getConfiguration();

    try {
      await create(email, password, req.ip);

      // setIDAPICookies(res, cookies); // TODO: How do we log the user in here?
    } catch (error) {
      const { message, status } = error;
      logger.error(error);

      trackMetric(Metrics.REGISTER_FAILURE);

      // TODO: Do we want to preserve the user input here? Having to retype email and password can be tiresome
      state = {
        ...state,
        globalMessage: {
          ...state.globalMessage,
          error: message,
        },
      };

      const html = renderer(Routes.REGISTRATION, {
        requestState: state,
        pageTitle: PageTitle.REGISTRATION,
      });
      return res.status(status).type('html').send(html);
    }

    trackMetric(Metrics.REGISTER_SUCCESS);

    return res.redirect(303, returnUrl || defaultReturnUri);
  }),
);

export default router;
