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

const { appSecret, stage } = getConfiguration();

export const applyMiddleware = (server: Express): void => {
	// add request id middleware
	server.use(requestIdMiddleware);
	// apply helmet before anything else
	server.use(helmetMiddleware as RequestHandler);
	server.use(urlencoded({ extended: true }) as RequestHandler);
	server.use(cookieParser(appSecret));
	server.use(compression());

	// add the DEV okta middleware if state === DEV
	if (stage === 'DEV') {
		server.use(oktaDevMiddleware);
	}

	server.use(loggerMiddleware);
	server.use(csrfMiddleware as RequestHandler);
	// eslint-disable-next-line @typescript-eslint/no-misused-promises -- express has its own way of handling async middleware
	server.use(requestStateMiddleware);
	server.use(routes);
	server.use(fourZeroFourMiddleware);
	server.use(routeErrorHandler);
};
