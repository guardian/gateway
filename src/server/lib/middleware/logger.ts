import { NextFunction, Request, Response } from 'express';
import { logger } from '@/server/lib/serverSideLogger';

export const loggerMiddleware = (
	req: Request,
	_: Response,
	next: NextFunction,
) => {
	logger.info(`${req.method}, ${req.path}`);
	next();
};
