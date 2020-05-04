import { GlobalState } from '@/shared/model/GlobalState';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { Main } from '@/client/main';

export const renderer: (url: string, globalState?: GlobalState) => string = (
  url,
  globalState = {},
) => {
  const context = {};

  const react = ReactDOMServer.renderToString(
    React.createElement(
      StaticRouter,
      {
        location: url,
        context,
      },
      React.createElement(Main, globalState),
    ),
  );

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset='utf-8' />
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Gateway</title>
      </head>
      <body style="margin:0">
        <div id="app">${react}</div>
      </body>
    </html>
  `;
};
