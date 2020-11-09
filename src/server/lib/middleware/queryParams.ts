import { NextFunction, Request } from 'express';
import { parseExpressQueryParams } from '@/server/lib/queryParams';
import { ResponseWithLocals } from '@/server/models/Express';

export const queryParamsMiddleware = (
  req: Request,
  res: ResponseWithLocals,
  next: NextFunction,
) => {
  const { query } = req;

  const parsedQueryParams = parseExpressQueryParams(req.method, query);

  res.locals.queryParams = parsedQueryParams;

  next();
};
