import { Request, Response, NextFunction } from 'express';

// middleware that adds headers to disable caching on certain particular routes,
// anything that has user information should use this
export const noCache = (_: Request, res: Response, next: NextFunction) => {
  res.set('Cache-Control', 'no-store');
  res.set('Pragma', 'no-cache');

  next();
};
