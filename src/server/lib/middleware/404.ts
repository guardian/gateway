import { Request } from 'express';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';

export const fourZeroFourRender = (res: ResponseWithRequestState) =>
  renderer('/404', {
    pageTitle: 'Not Found',
    requestState: res.locals,
  });

export const fourZeroFourMiddleware = (
  _: Request,
  res: ResponseWithRequestState,
) => {
  const html = fourZeroFourRender(res);
  res.type('html').status(404).send(html);
};
