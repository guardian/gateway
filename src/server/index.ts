import { default as express, Express, Response } from 'express';

const { PORT } = process.env;
const server: Express = express();

server.use((_, res: Response) => {
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Profile</title>
      <meta charset='utf-8' />
    </head>
    <body>
      <h1>Profile App</h1>
    </body>
  </html>`;
  res.type('html');
  res.send(html);
});

server.listen(PORT);
