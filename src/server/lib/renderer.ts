import { GlobalState } from '@/shared/model/GlobalState';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { Main } from '@/client/main';
import { brandBackground } from '@guardian/src-foundations/palette';
import qs from 'query-string';
import { getConfiguration } from '@/server/lib/configuration';
import { RoutingConfig } from '@/client/routes';
import { getAssets } from '@/server/lib/assets';
import { defaultLocals, Locals } from '@/server/models/Express';
import { FieldError } from '@/server/routes/changePassword';
import { CsrfErrors } from '@/shared/model/Errors';

const assets = getAssets();

// favicon shamefully stolen from dcr
const favicon =
  process.env.NODE_ENV === 'production'
    ? 'favicon-32x32.ico'
    : 'favicon-32x32-dev-yellow.ico';

interface RendererOpts {
  pageTitle?: string;
  locals: Locals;
}

const { gaUID } = getConfiguration();

// function to map from req.locals, to the GlobalState used by the client
const globalStateFromLocals = ({
  csrf,
  globalMessage,
  pageData,
  queryParams,
} = defaultLocals): GlobalState => {
  const globalState: GlobalState = {
    csrf,
    globalMessage,
    pageData,
  };

  // checking if csrf error exists in query params, and attaching it to the
  // forms field errors
  if (queryParams.csrfError) {
    // global state page data will already exist at this point
    // this is just a check to get typescript to compile
    if (!globalState.pageData) {
      globalState.pageData = {};
    }

    const fieldErrors: Array<FieldError> =
      globalState.pageData.fieldErrors ?? [];
    fieldErrors.push({
      field: 'csrf',
      message: CsrfErrors.CSRF_ERROR,
    });
    globalState.pageData.fieldErrors = fieldErrors;
  }

  return globalState;
};

export const renderer: (url: string, opts: RendererOpts) => string = (
  url,
  opts,
) => {
  const { locals, pageTitle = 'Gateway' } = opts;

  const context = {};

  const globalState = globalStateFromLocals(locals);

  const queryString = qs.stringify(locals.queryParams);

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
        <script src="/${assets.runtime}" defer></script>
        <script src="/${assets.vendors}" defer></script>
        <script src="/${assets.main}" defer></script>
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
