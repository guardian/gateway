import { NextFunction, Request, Response } from 'express';

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<Response | void>;

export const handleAsyncErrors = (handler: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return handler(req, res, next).catch((error) => {
      next(error);
    });
  };
};
