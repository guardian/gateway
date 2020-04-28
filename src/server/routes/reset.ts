import { Request, Response, Router } from 'express';
import { create as resetPassword } from '@/server/lib/idapi/resetPassword';
import { getProviderForEmail } from '@/shared/lib/emailProvider';
import qs, { ParsedUrlQueryInput } from 'querystring';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { GlobalState } from '@/shared/model/GlobalState';

interface ResetSentQuery {
  emailProvider?: string;
}

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

  const query: ResetSentQuery = {};
  const emailProvider = getProviderForEmail(email);
  if (emailProvider) query.emailProvider = emailProvider.id;

  const querystring = qs.stringify(query as ParsedUrlQueryInput);

  const html = renderer(
    `/reset/sent${querystring ? `?${querystring}` : ''}`,
    state,
  );
  res.type('html').send(html);
});

export default router;
