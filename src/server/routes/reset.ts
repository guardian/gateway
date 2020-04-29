import { Request, Response, Router } from 'express';
import { create as resetPassword } from '@/server/lib/idapi/resetPassword';
import { getProviderForEmail } from '@/shared/lib/emailProvider';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { GlobalState } from '@/shared/model/GlobalState';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { email = '' } = req.body;

  const state: GlobalState = {};

  try {
    await resetPassword(email, req.ip);
  } catch (e) {
    logger.error(e);
    state.error = 'There was an error!';
    res.type('html').send(renderer('/reset', state));
    return;
  }

  const emailProvider = getProviderForEmail(email);
  if (emailProvider) state.emailProvider = emailProvider.id;

  const html = renderer(`/reset/sent`, state);
  res.type('html').send(html);
});

export default router;
