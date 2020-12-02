import { NextFunction, Request } from 'express';
import { ResponseWithServerStateLocals } from '@/server/models/Express';
import { getMvtId } from '@/server/lib/getMvtId';
import { getConfiguration } from '../getConfiguration';

export const mvtIdMiddleware = (
  req: Request,
  res: ResponseWithServerStateLocals,
  next: NextFunction,
) => {
  res.locals.abTesting.mvtId = getMvtId(req, getConfiguration());
  next();
};
