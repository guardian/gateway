import {
  ResponseWithServerStateLocals,
  defaultServerState,
} from '@/server/models/Express';
import { Request, NextFunction } from 'express';

export const serverStateLocalsMiddleware = (
  _: Request,
  res: ResponseWithServerStateLocals,
  next: NextFunction,
) => {
  res.locals = defaultServerState;
  next();
};
