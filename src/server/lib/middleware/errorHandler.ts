import { NextFunction, Request, Response } from 'express';

export const routeErrorHandler = (
  // eslint-disable-next-line
  err: any, // ErrorRequestHandler uses type any
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);

  // handle CSRF token errors here
  res.status(403);
  res.send('csrf token error');
};
