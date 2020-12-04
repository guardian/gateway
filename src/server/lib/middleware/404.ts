import { PageTitle } from '@/shared/model/PageTitle';
import { Request } from 'express';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithServerStateLocals } from '@/server/models/Express';

export const fourZeroFourMiddleware = (
  _: Request,
  res: ResponseWithServerStateLocals,
) => {
  const html = renderer('/404', {
    pageTitle: PageTitle.NOT_FOUND,
    serverState: res.locals,
  });
  res.type('html');
  res.status(404).send(html);
};
