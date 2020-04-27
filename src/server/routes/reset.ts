import { Request, Response, Router } from 'express';
import { create as resetPassword } from '@/server/lib/idapi/resetPassword';
import { getProviderForEmail } from '@/shared/lib/emailProvider';
import qs, { ParsedUrlQueryInput } from 'querystring';
import { logger } from '@/server/lib/logger';

interface ResetSentQuery {
  emailProvider?: string;
}

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { email = '' } = req.body;

  try {
    await resetPassword(email, req.ip);
  } catch (e) {
    logger.error(e);
  }

  const query: ResetSentQuery = {};
  const emailProvider = getProviderForEmail(email);
  if (emailProvider) query.emailProvider = emailProvider.id;

  const querystring = qs.stringify(query as ParsedUrlQueryInput);

  res.redirect(303, `/reset/sent${querystring ? `?${querystring}` : ''}`);
});

export default router;
