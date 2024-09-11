import { NextFunction, Request, Response } from 'express';
import { AsyncLocalStorage } from 'node:async_hooks';

type RequestContext = {
	requestId?: string;
	ip?: string;
};

export const requestContext = new AsyncLocalStorage<RequestContext>();

/**
 * This middleware handles creating a new context store for each request.
 *
 * I recommend only using this store for for logging and debugging,
 * as relying on it can quickly spiral into hard to refactor and hard to test
 * spaghetti code.
 *
 * @param request - The Request object to be stored in the Store
 * @param response - The Response object to be stored in the Store
 * @param next - The next middleware to be called and wrapped in the Stores scope
 */
export const requestContextMiddleware = (
	request: Request,
	_: Response,
	next: NextFunction,
) => {
	// Express middlewares form a function call chain under the hood, so wrapping one middleware in a Store
	// will make it available to all subsequent middlewares in the chain.
	requestContext.run(
		{
			requestId: request.get('x-request-id'),
			ip: request.ip,
		},
		next,
	);
};
