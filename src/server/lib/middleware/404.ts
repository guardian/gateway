import { PageTitle } from '@/shared/model/PageTitle';
import { Request } from 'express';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';

export const fourZeroFourMiddleware = (
  _: Request,
  res: ResponseWithRequestState,
) => {
  const html = renderer('/404', {
    pageTitle: PageTitle.NOT_FOUND,
    requestState: res.locals,
  });
  res.type('html');
  res.status(404).send(html);
};
