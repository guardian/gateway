import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

/**
 * Middleware to add a random request ID to the request.
 * This is used to identify requests in the logs.
 */
export const requestIdMiddleware = (
	req: Request,
	_: Response,
	next: NextFunction,
) => {
	// eslint-disable-next-line functional/immutable-data -- We have to assign the request ID to the headers object. This is the only place where this should be done.
	req.headers['x-request-id'] = randomUUID();

	next();
};
