import { NextFunction, Request, Response } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<ResponseWithRequestState | void>;

export const handleAsyncErrors = (handler: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return handler(req, res, next).catch((error) => {
      next(error);
    });
  };
};
