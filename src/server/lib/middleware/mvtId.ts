import { NextFunction, Request } from 'express';
import { ResponseWithServerStateLocals } from '@/server/models/Express';
import { getConfiguration } from '../configuration';

const { stage } = getConfiguration();

const getMvtIdFromCookies = (cookies: Request['cookies']): number => {
  if (cookies['GU_mvt_id_local'] && stage === 'DEV') {
    return Number(cookies['GU_mvt_id_local']) || 0;
  }

  if (cookies['GU_mvt_id']) {
    return Number(cookies['GU_mvt_id']) || 0;
  }

  return 0;
};

export const mvtIdMiddleware = (
  req: Request,
  res: ResponseWithServerStateLocals,
  next: NextFunction,
) => {
  res.locals.abTesting.mvtId = getMvtIdFromCookies(req.cookies);

  next();
};
