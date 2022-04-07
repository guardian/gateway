import { RoutePaths } from '@/shared/model/Routes';
import { Router } from 'express';
import { rateLimiterMiddleware } from './middleware/rateLimit';

const router = Router();

// We only expose a rate limited typed router because we want to apply the limiter to everything.
export const rateLimitedTypedRouter = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: (path: RoutePaths, ...handlers: Array<any>) => {
    return router.get(path, rateLimiterMiddleware, ...handlers);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: (path: RoutePaths, ...handlers: Array<any>) => {
    return router.post(path, rateLimiterMiddleware, ...handlers);
  },
  router,
};
