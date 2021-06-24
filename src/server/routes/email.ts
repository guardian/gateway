import { Router, Request, Response } from 'express';
import { sendExampleEmail } from '@/email';

const router = Router();

router.get('/send-example-email?:to', async (req: Request, res: Response) => {
  const { to } = req.query;

  if (typeof to !== 'string') {
    return res.sendStatus(422);
  }

  try {
    await sendExampleEmail({ to });
  } catch (error) {
    if (error.statusCode) {
      return res.sendStatus(error.statusCode);
    }
    return res.sendStatus(500);
  }

  return res.sendStatus(200);
});

export default router;
