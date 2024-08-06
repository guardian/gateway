import type { Express } from 'express';
import { default as express } from 'express';
import { applyMiddleware } from '@/server/lib/middleware';

const createServer = (): Express => {
	const server: Express = express();
	// This is set to true to allow Express to read IP address values from
	// X-Forwarded-For header values (cf. https://expressjs.com/en/guide/behind-proxies.html)
	// This is necessary for accurately logging the IP address in rate limiter calls.
	server.set('trust proxy', true);
	applyMiddleware(server);
	return server;
};

export default createServer;
