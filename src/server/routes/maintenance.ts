import { Router } from 'express';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';

const router = Router();

router.use('/maintenance', (_, res: ResponseWithRequestState) => {
  const html = renderer('/maintenance', {
    pageTitle: 'Maintenance',
    requestState: res.locals,
  });
  return res.type('html').status(503).send(html);
});

export default router;
