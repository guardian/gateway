import { Request, Response, NextFunction } from 'express';

// middleware that adds headers to disable caching on certain particular routes,
// anything that has user information should use this
export const noCache = (_: Request, res: Response, next: NextFunction) => {
  res.set('Cache-Control', 'no-cache, private');
  res.set('Pragma', 'no-cache');

  next();
};

export const removeNoCache = (
  _: Request,
  res: Response,
  next: NextFunction,
) => {
  res.removeHeader('Cache-Control');
  res.removeHeader('Pragma');

  next();
};
