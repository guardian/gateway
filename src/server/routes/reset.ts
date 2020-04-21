import { Request, Response, Router } from 'express';
import { create as resetPassword } from '@/server/lib/idapi/resetPassword';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { email = '' } = req.body;
  try {
    const result = await resetPassword(email, req.ip);
    console.log('RESULT:', result);
  } catch (e) {
    console.log(e);
  }
  res.redirect(303, '/reset/sent');
});

export default router;
