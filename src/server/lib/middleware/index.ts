import { Express, RequestHandler, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { helmetMiddleware } from '@/server/lib/middleware/helmet';
import { loggerMiddleware } from '@/server/lib/middleware/logger';
import { oktaDevMiddleware } from '@/server/lib/middleware/oktaDev';
import { csrfMiddleware } from '@/server/lib/middleware/csrf';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { requestStateMiddleware } from '@/server/lib/middleware/requestState';
import { default as routes } from '@/server/routes';
import { routeErrorHandler } from '@/server/lib/middleware/errorHandler';
import { fourZeroFourMiddleware } from '@/server/lib/middleware/404';
import { requestIdMiddleware } from './requestId';
import { requestContextMiddleware } from './requestContext';

const { appSecret, stage } = getConfiguration();

export const applyMiddleware = (server: Express): void => {
	// add request id middleware
	server.use(requestIdMiddleware);
	server.use(requestContextMiddleware);
	// apply helmet before anything else
	server.use(helmetMiddleware as RequestHandler);
	server.use(urlencoded({ extended: true }));
	// As of Express 5.x req.body is `undefined` by default if the body parser is not used.
	// This regularly happens when the request is not a form submission, such as a GET request.
	// We should consider enabling `@typescript-eslint/no-unsafe-assignment` in the future
	// to force us to safely handle the `req.body` type.
	server.use((req, _, next) => {
		// eslint-disable-next-line functional/immutable-data -- Fix for express 5.x req.body being undefined
		req.body = req.body ?? {};
		next();
	});
	server.use(cookieParser(appSecret));
	server.use(compression());

	// add the DEV okta middleware if state === DEV
	if (stage === 'DEV') {
		server.use(oktaDevMiddleware);
	}

	server.use(loggerMiddleware);
	server.use(csrfMiddleware as RequestHandler);
	server.use(requestStateMiddleware);
	server.use(routes);
	server.use(fourZeroFourMiddleware);
	server.use(routeErrorHandler);
};
