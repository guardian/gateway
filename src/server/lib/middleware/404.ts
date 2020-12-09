import { PageTitle } from '@/shared/model/PageTitle';
import { Request } from 'express';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';

export const fourZeroFourRender = (res: ResponseWithRequestState) =>
  renderer('/404', {
    pageTitle: PageTitle.NOT_FOUND,
    requestState: res.locals,
  });

export const fourZeroFourMiddleware = (
  _: Request,
  res: ResponseWithRequestState,
) => {
  const html = fourZeroFourRender(res);
  res.type('html').status(404).send(html);
};
