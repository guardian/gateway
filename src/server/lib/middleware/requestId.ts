import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

/**
 * Middleware to add a random request ID to the request.
 * This is used to identify requests in the logs.
 */
export const requestIdMiddleware = (
	req: Request,
	_: Response,
	next: NextFunction,
) => {
	// eslint-disable-next-line functional/immutable-data
	req.headers['x-request-id'] = randomUUID();

	next();
};
