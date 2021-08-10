import { PageTitle } from '@/shared/model/PageTitle';
import { Request } from 'express';
import { renderer } from '@/server/lib/renderHelper';
import { ResponseWithRequestState } from '@/server/models/Express';

export const fourZeroFourRender = (res: ResponseWithRequestState) =>
  renderer(res.app.get('vite'), '/404', {
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
