import { default as express, Express, Response } from 'express';
import path from "path";

const { PORT } = process.env;
const server: Express = express();

server.use('/static', express.static(path.resolve(__dirname, 'static')));

server.use((_, res: Response) => {
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Profile</title>
      <meta charset='utf-8' />
    </head>
    <body>
      <div id="app"></div>
    </body>
    <script src="/static/bundle.js"></script>
  </html>`;
  res.type('html');
  res.send(html);
});

server.listen(PORT);
