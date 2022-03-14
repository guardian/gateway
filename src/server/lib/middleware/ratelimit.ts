import { RequestWithTypedQuery } from '@/server/models/Express';
import { NextFunction, Response } from 'express';

export const rateLimiterMiddleware = (
  req: RequestWithTypedQuery,
  res: Response,
  next: NextFunction,
) => {
  next();
};
