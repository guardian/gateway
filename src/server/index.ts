import '@/server/lib/env';
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
import { Routes } from '@/shared/model/Routes';

const { port, baseUri } = getConfiguration();
const server: Express = express();

const loggerMiddleware = (req: Request, _: Response, next: NextFunction) => {
  logger.info(`${req.method}, ${req.path}`);
  next();
};

enum HELMET_OPTIONS {
  SELF = "'self'",
  NONE = "'none'",
  UNSAFE_INLINE = "'unsafe-inline'",
}

const helmetConfig: IHelmetConfiguration = {
  contentSecurityPolicy: {
    directives: {
      baseUri: [HELMET_OPTIONS.NONE],
      defaultSrc: [HELMET_OPTIONS.NONE],
      formAction: [`${baseUri}${Routes.RESET}`],
      frameAncestors: [HELMET_OPTIONS.NONE],
      styleSrc: [HELMET_OPTIONS.UNSAFE_INLINE],
      imgSrc: ['static.guim.co.uk'],
      fontSrc: ['assets.guim.co.uk'],
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
