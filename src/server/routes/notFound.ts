import { Router } from 'express';
import { PageTitle } from '@/shared/model/PageTitle';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';
import { Routes } from '@/shared/model/Routes';

const router = Router();

router.use('*', (_, res: ResponseWithRequestState) => {
  const html = renderer(Routes.FOUR_ZERO_FOUR, {
    pageTitle: PageTitle.NOT_FOUND,
    requestState: res.locals,
  });
  return res.type('html').send(html);
});

export default router;
