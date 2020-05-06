import {
  default as express,
  Express,
  NextFunction,
  Request,
  Response,
} from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
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

server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());
server.use(helmet());

server.use(loggerMiddleware);

server.use(routes);

server.use((req: Request, res: Response) => {
  const html = renderer('/404');
  res.type('html');
  res.status(404).send(html);
});

server.listen(port);
logger.info(`server running on port ${port}`);
