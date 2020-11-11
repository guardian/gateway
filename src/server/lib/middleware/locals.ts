import { ResponseWithLocals, defaultLocals } from '@/server/models/Express';
import { Request, NextFunction } from 'express';

export const localsMiddleware = (
  _: Request,
  res: ResponseWithLocals,
  next: NextFunction,
) => {
  res.locals = defaultLocals;
  next();
};
