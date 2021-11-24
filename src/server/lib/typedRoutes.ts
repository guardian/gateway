import { RoutePaths } from '@/shared/lib/routeUtils';
import { Router } from 'express';

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
  router: router,
};
