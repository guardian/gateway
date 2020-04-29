import { Request, Response, Router } from 'express';
import { create as resetPassword } from '@/server/lib/idapi/resetPassword';
import { getProviderForEmail } from '@/shared/lib/emailProvider';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { GlobalState } from '@/shared/model/GlobalState';
import { Routes } from '@/shared/model/Routes';

const router = Router();

router.get(Routes.RESET, (req: Request, res: Response) => {
  const html = renderer(Routes.RESET);
  res.type('html').send(html);
});

router.post(Routes.RESET, async (req: Request, res: Response) => {
  const { email = '' } = req.body;

  const state: GlobalState = {};

  try {
    await resetPassword(email, req.ip);
  } catch (e) {
    logger.error(e);
    state.error = e;
    res.type('html').send(renderer(Routes.RESET, state));
    return;
  }

  const emailProvider = getProviderForEmail(email);
  if (emailProvider) state.emailProvider = emailProvider.id;

  const html = renderer(Routes.RESET_SENT, state);
  res.type('html').send(html);
});

export default router;
