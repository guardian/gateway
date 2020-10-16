import { Express, Request, Response } from 'express';
import { default as routes } from '@/server/routes';
import { renderer } from '@/server/lib/renderer';

export const applyRoutes = (server: Express): void => {
  // all routes from routes folder
  server.use(routes);

  // 404 default route
  server.use((req: Request, res: Response) => {
    const html = renderer('/404', req);
    res.type('html');
    res.status(404).send(html);
  });
};
