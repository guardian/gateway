import { NextFunction, Request } from 'express';
import { ResponseWithServerStateLocals } from '@/server/models/Express';
import { getConfiguration } from '../configuration';

const { stage } = getConfiguration();

export const mvtIdMiddleware = (
  req: Request,
  res: ResponseWithServerStateLocals,
  next: NextFunction,
) => {
  // defaults to 0 already
  let mvtId = res.locals.abTesting.mvtId;

  if (req.cookies['GU_mvt_id']) {
    mvtId = Number(req.cookies['GU_mvt_id']) || 0;
  }

  if (req.cookies['GU_mvt_id_local'] && stage === 'DEV') {
    mvtId = Number(req.cookies['GU_mvt_id_local']) || 0;
  }

  res.locals.abTesting.mvtId = mvtId;

  next();
};
