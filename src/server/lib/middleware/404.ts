import { Request, Response } from 'express';
import { renderer } from '@/server/lib/renderer';

export const fourZeroFourRender = (res: Response) =>
  renderer('/404', {
    pageTitle: 'Not Found',
    requestState: res.requestState,
  });

export const fourZeroFourMiddleware = (_: Request, res: Response) => {
  const html = fourZeroFourRender(res);
  res.type('html').status(404).send(html);
};
