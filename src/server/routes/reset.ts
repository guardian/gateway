import { Request, Router } from 'express';
import { create as resetPassword } from '@/server/lib/idapi/resetPassword';
import { getProviderForEmail } from '@/shared/lib/emailProvider';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { Routes } from '@/shared/model/Routes';
import { getEmailFromPlaySessionCookie } from '@/server/lib/playSessionCookie';
import { ResponseWithServerStateLocals } from '@/server/models/Express';
import { trackMetric } from '@/server/lib/AWS';
import { Metrics } from '@/server/models/Metrics';
import { removeNoCache } from '@/server/lib/middleware/cache';
import { PageTitle } from '@/shared/model/PageTitle';

const router = Router();

router.get(Routes.RESET, (req: Request, res: ResponseWithServerStateLocals) => {
  const emailFromPlaySession = getEmailFromPlaySessionCookie(req);
  if (emailFromPlaySession) {
    res.locals.pageData.email = emailFromPlaySession;
  }

  const html = renderer(Routes.RESET, {
    serverState: res.locals,
    pageTitle: PageTitle.RESET,
  });
  res.type('html').send(html);
});

router.post(
  Routes.RESET,
  async (req: Request, res: ResponseWithServerStateLocals) => {
    const { email = '' } = req.body;

    const { returnUrl } = res.locals.queryParams;

    try {
      await resetPassword(email, req.ip, returnUrl);
    } catch (error) {
      const { message, status } = error;
      logger.error(error);

      trackMetric(Metrics.SEND_PASSWORD_RESET_FAILURE);

      res.locals.globalMessage.error = message;

      const html = renderer(Routes.RESET, {
        serverState: res.locals,
        pageTitle: PageTitle.RESET,
      });
      return res.status(status).type('html').send(html);
    }

    trackMetric(Metrics.SEND_PASSWORD_RESET_SUCCESS);

    const emailProvider = getProviderForEmail(email);
    if (emailProvider) {
      res.locals.pageData.emailProvider = emailProvider.id;
    }

    const html = renderer(Routes.RESET_SENT, {
      serverState: res.locals,
      pageTitle: PageTitle.RESET_SENT,
    });
    return res.type('html').send(html);
  },
);

router.get(
  Routes.RESET_SENT,
  removeNoCache,
  (_: Request, res: ResponseWithServerStateLocals) => {
    const html = renderer(Routes.RESET_SENT, {
      pageTitle: PageTitle.RESET_SENT,
      serverState: res.locals,
    });
    res.type('html').send(html);
  },
);

export default router;
