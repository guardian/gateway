import { RoutePaths } from '@/shared/model/Routes';
import { Router } from 'express';
import { rateLimiterMiddleware } from './middleware/rateLimit';

const router = Router();

export const typedRouter = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: (path: RoutePaths, ...handlers: Array<any>) => {
    return router.get(path, ...handlers);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: (path: RoutePaths, ...handlers: Array<any>) => {
    return router.post(path, ...handlers);
  },
  router,
};

// Use this if you want to rate limit all routes registered under the router.
export const rateLimitedTypedRouter = {
  ...typedRouter,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: (path: RoutePaths, ...handlers: Array<any>) => {
    return router.get(path, rateLimiterMiddleware, ...handlers);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: (path: RoutePaths, ...handlers: Array<any>) => {
    return router.post(path, rateLimiterMiddleware, ...handlers);
  },
};
