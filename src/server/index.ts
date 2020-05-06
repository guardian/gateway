import {
  default as express,
  Express,
  NextFunction,
  Request,
  Response,
} from 'express';
import cookieParser from 'cookie-parser';
import { default as helmet, IHelmetConfiguration } from 'helmet';
import { logger } from '@/server/lib/logger';
import { getConfiguration } from '@/server/lib/configuration';
import { default as routes } from '@/server/routes';
import { renderer } from '@/server/lib/renderer';

const { port } = getConfiguration();
const server: Express = express();

const loggerMiddleware = (req: Request, _: Response, next: NextFunction) => {
  logger.info(`${req.method}, ${req.path}`);
  next();
};

enum HELMET_OPTIONS {
  SELF = "'self'",
  NONE = "'none'",
}

const helmetConfig: IHelmetConfiguration = {
  contentSecurityPolicy: {
    directives: {
      baseUri: [HELMET_OPTIONS.SELF],
      defaultSrc: [HELMET_OPTIONS.SELF],
      formAction: [HELMET_OPTIONS.NONE],
      frameAncestors: [HELMET_OPTIONS.NONE],
      pluginTypes: [HELMET_OPTIONS.NONE],
    },
  },
};

server.use(helmet(helmetConfig));
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());

server.use(loggerMiddleware);

server.use(routes);

server.use((req: Request, res: Response) => {
  const html = renderer('/404');
  res.type('html');
  res.status(404).send(html);
});

server.listen(port);
logger.info(`server running on port ${port}`);
