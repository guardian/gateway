import { Router } from 'express';
import type { RoutePaths } from '@/shared/model/Routes';
import { rateLimiterMiddleware } from './middleware/rateLimit';

const router = Router();

// We only expose a rate limited typed router because we want to apply the limiter to everything.
export const rateLimitedTypedRouter = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	get: (path: RoutePaths, ...handlers: any[]) => {
		// eslint-disable-next-line @typescript-eslint/no-misused-promises -- express has its own way of handling async middleware
		return router.get(path, rateLimiterMiddleware, ...handlers);
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	post: (path: RoutePaths, ...handlers: any[]) => {
		// eslint-disable-next-line @typescript-eslint/no-misused-promises -- express has its own way of handling async middleware
		return router.post(path, rateLimiterMiddleware, ...handlers);
	},
	router,
};
