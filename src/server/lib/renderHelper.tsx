import { ClientState, FieldError } from '@/shared/model/ClientState';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
// import { StaticRouterContext } from 'react-router';
import { App } from '@/client/app';
import { brandBackground } from '@guardian/src-foundations/palette';
import qs from 'query-string';
// import { getConfiguration } from '@/server/lib/getConfiguration';
// import { RoutingConfig } from '@/client/routes';
// import { getAssets } from '@/server/lib/getAssets';
import { RequestState } from '@/server/models/Express';
import { CsrfErrors } from '@/shared/model/Errors';
import { ABProvider } from '@guardian/ab-react';
import { tests } from '@/shared/model/experiments/abTests';
import { abSwitches } from '@/shared/model/experiments/abSwitches';
import { RoutingConfig } from '@/client/routes';
import { resets } from '@guardian/src-foundations/utils';
import { ViteDevServer } from 'vite';
import { getConfiguration } from './getConfiguration';
// const assets = getAssets();
// const legacyAssets = getAssets(true);

// favicon shamefully stolen from dcr
const favicon =
  process.env.NODE_ENV === 'production'
    ? 'favicon-32x32.ico'
    : 'favicon-32x32-dev-yellow.ico';

interface RendererOpts {
  pageTitle: string;
  requestState: RequestState;
}

const { gaUID } = getConfiguration();

const clientStateFromRequestStateLocals = ({
  csrf,
  globalMessage,
  pageData,
  queryParams,
  abTesting,
  clientHosts,
}: RequestState): ClientState => {
  const clientState: ClientState = {
    csrf,
    globalMessage,
    pageData,
    abTesting,
    clientHosts,
  };

  // checking if csrf error exists in query params, and attaching it to the
  // forms field errors
  if (queryParams.csrfError) {
    // global state page data will already exist at this point
    // this is just a check to get typescript to compile
    const fieldErrors: Array<FieldError> =
      clientState.pageData?.fieldErrors ?? [];
    fieldErrors.push({
      field: 'csrf',
      message: CsrfErrors.CSRF_ERROR,
    });
    return {
      ...clientState,
      pageData: {
        ...clientState.pageData,
        fieldErrors,
      },
    };
  } else {
    return clientState;
  }
};

export const renderer: (
  vite: ViteDevServer,
  url: string,
  opts: RendererOpts,
) => Promise<string> = async (vite, url, { requestState, pageTitle }) => {
  const clientState = clientStateFromRequestStateLocals(requestState);
  const queryString = qs.stringify(requestState.queryParams);
  const location = `${url}${queryString ? `?${queryString}` : ''}`;
  const routingConfig: RoutingConfig = {
    clientState,
    location,
  };

  const tpl = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset='utf-8' />
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="${brandBackground.primary}" />
        <link rel="icon" href="https://static.guim.co.uk/images/${favicon}">
        <title>${pageTitle} | The Guardian</title>
        <script>window.gaUID = "${gaUID && gaUID.id}"</script>

        <script id="routingConfig" type="application/json">${JSON.stringify(
          routingConfig,
        )}</script>
        <style>${resets.defaults}</style>
      </head>
      <body style="margin:0">
        <div id="app"><!--ssr--></div>
      </body>
    </html>
  `;
  const parsed = await vite.transformIndexHtml(url, tpl);
  const { render } = await vite.ssrLoadModule('/src/server/lib/renderer.tsx');
  const app = render(url, { requestState, pageTitle });
  return parsed.replace('<!--ssr-->', app);
};
