import { NextFunction, Request } from 'express';
import { parseExpressQueryParams } from '@/server/lib/queryParams';
import { ResponseWithServerStateLocals } from '@/server/models/Express';

export const queryParamsMiddleware = (
  req: Request,
  res: ResponseWithServerStateLocals,
  next: NextFunction,
) => {
  const { query } = req;

  const parsedQueryParams = parseExpressQueryParams(req.method, query);

  res.locals.queryParams = parsedQueryParams;

  next();
};
