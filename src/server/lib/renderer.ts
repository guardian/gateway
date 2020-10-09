import { GlobalState } from '@/shared/model/GlobalState';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { Main } from '@/client/main';
import { brandBackground } from '@guardian/src-foundations/palette';
import { QueryParams } from '@/shared/model/QueryParams';
import qs from 'query-string';
import { getConfiguration } from '@/server/lib/configuration';
import { RoutingConfig } from '@/client/routes';

// favicon shamefully stolen from dcr
const favicon =
  process.env.NODE_ENV === 'production'
    ? 'favicon-32x32.ico'
    : 'favicon-32x32-dev-yellow.ico';

interface RendererOpts {
  globalState?: GlobalState;
  queryParams?: QueryParams;
  pageTitle?: string;
}

const { gaUID } = getConfiguration();

export const renderer: (url: string, opts?: RendererOpts) => string = (
  url,
  opts = {},
) => {
  const { globalState = {}, queryParams = {}, pageTitle = 'Gateway' } = opts;

  const context = {};

  const queryString = qs.stringify(queryParams);

  const location = `${url}${queryString ? `?${queryString}` : ''}`;

  // Any changes made here must also be made to the hydration in the static webpack bundle
  const react = ReactDOMServer.renderToString(
    React.createElement(
      StaticRouter,
      {
        location,
        context,
      },
      React.createElement(Main, globalState),
    ),
  );

  const routingConfig: RoutingConfig = {
    globalState,
    location,
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset='utf-8' />
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="${brandBackground.primary}" />
        <link rel="icon" href="https://static.guim.co.uk/images/${favicon}">
        <title>${pageTitle} | The Guardian</title>
        <script>window.gaUID = "${gaUID.id}"</script>
        <script src="/gateway-static/bundle.js" defer></script>
        <script id="routingConfig" type="application/json">${JSON.stringify(
          routingConfig,
        )}</script>
      </head>
      <body style="margin:0">
        <div id="app">${react}</div>
      </body>
    </html>
  `;
};
