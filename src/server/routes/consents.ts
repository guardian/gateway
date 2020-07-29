import { Router, Request, Response } from 'express';

const router = Router();

router.get('/verify-email', (req: Request, res: Response) => {
  res.send('OK');
});

export default router;
