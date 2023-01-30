import { Router, Response } from 'express';
import { renderer } from '@/server/lib/renderer';

const router = Router();

router.use('/maintenance', (_, res: Response) => {
  const html = renderer('/maintenance', {
    pageTitle: 'Maintenance',
    requestState: res.requestState,
  });
  return res.type('html').status(503).send(html);
});

export default router;
