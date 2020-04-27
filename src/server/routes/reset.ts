import { Request, Response, Router } from 'express';
import { create as resetPassword } from '@/server/lib/idapi/resetPassword';
import { getProviderForEmail } from '@/shared/lib/emailProvider';
import qs, { ParsedUrlQueryInput } from 'querystring';

interface ResetSentQuery {
  emailProvider?: string;
}

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { email = '' } = req.body;
  try {
    const result = await resetPassword(email, req.ip);
    console.log('RESULT:', result);
  } catch (e) {
    console.log(e);
  }

  const query: ResetSentQuery = {};
  const emailProvider = getProviderForEmail(email);
  if (emailProvider) query.emailProvider = emailProvider.id;

  const querystring = qs.stringify(query as ParsedUrlQueryInput);

  res.redirect(303, `/reset/sent${querystring ? `?${querystring}` : ''}`);
});

export default router;
