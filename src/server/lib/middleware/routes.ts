import { Express, Request, Response } from 'express';
import { default as routes } from '@/server/routes';
import { renderer } from '@/server/lib/renderer';
import { PageTitle } from '@/shared/model/PageTitle';

export const applyRoutes = (server: Express): void => {
  // all routes from routes folder
  server.use(routes);

  // 404 default route
  server.use((_: Request, res: Response) => {
    const html = renderer('/404', {
      pageTitle: PageTitle.NOT_FOUND,
    });
    res.type('html');
    res.status(404).send(html);
  });
};
