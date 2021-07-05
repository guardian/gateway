import { Request, Router } from 'express';
import deepmerge from 'deepmerge';
import { getToken } from '@/server/lib/idapi/resetPassword';
import { getType } from '@/server/lib/idapi/user';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { Routes } from '@/shared/model/Routes';
import { getEmailFromPlaySessionCookie } from '@/server/lib/playSessionCookie';
import { ResponseWithRequestState } from '@/server/models/Express';
import { trackMetric } from '@/server/lib/trackMetric';
import { Metrics } from '@/server/models/Metrics';
import { removeNoCache } from '@/server/lib/middleware/cache';
import { PageTitle } from '@/shared/model/PageTitle';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { sendResetPasswordEmail } from '@/email';

const router = Router();

router.get(Routes.RESET, (req: Request, res: ResponseWithRequestState) => {
  let state = res.locals;
  const emailFromPlaySession = getEmailFromPlaySessionCookie(req);

  if (emailFromPlaySession) {
    state = deepmerge(state, {
      pageData: {
        email: emailFromPlaySession,
      },
    });
  }

  const html = renderer(Routes.RESET, {
    requestState: state,
    pageTitle: PageTitle.RESET,
  });
  res.type('html').send(html);
});

router.post(
  Routes.RESET,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;

    const { email = '' } = req.body;

    try {
      const userType = await getType(email, req.ip);

      switch (userType) {
        case 'new': {
          console.log('TODO: Send no account email');
          // sendNoAccountExistsEmail({ to: email});
          break;
        }
        case 'guest':
        case 'current': {
          const token = await getToken(email, req.ip);
          sendResetPasswordEmail({ token, to: email });
          break;
        }
        default: {
          // This shouldn't happen but these external response types are not typed and
          // could change so we handle this here by triggering a generic error
          throw new Error();
        }
      }
    } catch (error) {
      const { message, status } = error;
      logger.error(error);

      trackMetric(Metrics.SEND_PASSWORD_RESET_FAILURE);

      state = deepmerge(state, {
        globalMessage: {
          error: message,
        },
      });

      const html = renderer(Routes.RESET, {
        requestState: state,
        pageTitle: PageTitle.RESET,
      });
      return res.status(status).type('html').send(html);
    }

    trackMetric(Metrics.SEND_PASSWORD_RESET_SUCCESS);

    const html = renderer(Routes.RESET_SENT, {
      requestState: state,
      pageTitle: PageTitle.RESET_SENT,
    });
    return res.type('html').send(html);
  }),
);

router.get(
  Routes.RESET_SENT,
  removeNoCache,
  (_: Request, res: ResponseWithRequestState) => {
    const html = renderer(Routes.RESET_SENT, {
      pageTitle: PageTitle.RESET_SENT,
      requestState: res.locals,
    });
    res.type('html').send(html);
  },
);

export default router;
