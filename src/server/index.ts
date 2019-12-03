import { default as express, Express, Response } from 'express';

const { PORT } = process.env;
const server: Express = express();

server.use((_, res: Response) => {
  res.json('OK');
});

server.listen(PORT);
