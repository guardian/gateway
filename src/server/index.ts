import { default as express, Express, Response } from "express";
import ReactDOMServer from "react-dom/server";
import React from "react";
import { Main } from "../client/main";
import path from "path";

const { PORT } = process.env;
const server: Express = express();

server.use("/static", express.static(path.resolve(__dirname, "static")));
server.get("/healthcheck", (_, res: Response) => {
  res.sendStatus(204);
});
server.use((_, res: Response) => {
  const react = ReactDOMServer.renderToString(React.createElement(Main));
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset='utf-8' />
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Gateway</title>
    </head>
    <body style="margin:0">
      <div id="app">${react}</div>
    </body>
    <script src="/static/bundle.js"></script>
  </html>`;
  res.type("html");
  res.send(html);
});

server.listen(PORT);
