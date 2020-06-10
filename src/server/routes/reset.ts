import { Request, Router } from 'express';
import { create as resetPassword } from '@/server/lib/idapi/resetPassword';
import { getProviderForEmail } from '@/shared/lib/emailProvider';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { GlobalState } from '@/shared/model/GlobalState';
import { Routes } from '@/shared/model/Routes';
import { getEmailFromPlaySessionCookie } from '@/server/lib/playSessionCookie';
import { ResponseWithLocals } from '@/server/models/Express';

const router = Router();

router.get(Routes.RESET, (req: Request, res: ResponseWithLocals) => {
  const state: GlobalState = {};

  const emailFromPlaySession = getEmailFromPlaySessionCookie(req);
  if (emailFromPlaySession) {
    state.email = emailFromPlaySession;
  }

  const html = renderer(Routes.RESET, {
    globalState: state,
    queryParams: res.locals.queryParams,
  });
  res.type('html').send(html);
});

router.post(Routes.RESET, async (req: Request, res: ResponseWithLocals) => {
  const { email = '' } = req.body;

  const state: GlobalState = {};

  const { returnUrl } = res.locals.queryParams;

  try {
    await resetPassword(email, req.ip, returnUrl);
  } catch (e) {
    logger.error(e);
    state.error = e;
    res.type('html').send(
      renderer(Routes.RESET, {
        globalState: state,
        queryParams: res.locals.queryParams,
      }),
    );
    return;
  }

  const emailProvider = getProviderForEmail(email);
  if (emailProvider) {
    state.emailProvider = emailProvider.id;
  }

  const html = renderer(Routes.RESET_SENT, {
    globalState: state,
    queryParams: res.locals.queryParams,
  });
  res.type('html').send(html);
});

export default router;
