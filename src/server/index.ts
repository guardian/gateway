import { default as express, Express, Response } from "express";
import path from "path";

const { PORT } = process.env;
const server: Express = express();

server.use("/static", express.static(path.resolve(__dirname, "static")));

server.use((_, res: Response) => {
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset='utf-8' />
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Profile</title>
    </head>
    <body style="margin:0">
      <div id="app"></div>
    </body>
    <script src="/static/bundle.js"></script>
  </html>`;
  res.type("html");
  res.send(html);
});

server.listen(PORT);
