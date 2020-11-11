import { Express, Request } from 'express';
import { default as routes } from '@/server/routes';
import { renderer } from '@/server/lib/renderer';
import { PageTitle } from '@/shared/model/PageTitle';
import { routeErrorHandler } from '@/server/lib/middleware/errorHandler';
import { ResponseWithLocals } from '@/server/models/Express';

export const applyRoutes = (server: Express): void => {
  // all routes from routes folder
  server.use(routes);

  // 404 default route
  server.use((_: Request, res: ResponseWithLocals) => {
    const html = renderer('/404', {
      pageTitle: PageTitle.NOT_FOUND,
      locals: res.locals,
    });
    res.type('html');
    res.status(404).send(html);
  });

  server.use(routeErrorHandler);
};
