import { default as express, Router, Response } from 'express';
import path from 'path';

const router = Router();

router.use('/server-error', (_, res: Response) => {
  return res.sendStatus(500);
});

router.use(
  '/gateway-static',
  express.static(path.resolve(__dirname, 'static'), {
    cacheControl: true,
    maxAge: 31536000000, // 1 year in milliseconds
  }),
);

router.use(
  '/.well-known',
  express.static(path.resolve(__dirname, '.well-known'), {
    cacheControl: true,
    maxAge: 2592000000, // 30 days in milliseconds
  }),
);

router.get('/healthcheck', (_, res: Response) => {
  res.status(200).send('200 OK');
});

export default router;
