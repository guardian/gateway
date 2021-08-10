import { ClientState, FieldError } from '@/shared/model/ClientState';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { App } from '@/client/app';
import qs from 'query-string';
import { RequestState } from '@/server/models/Express';
import { CsrfErrors } from '@/shared/model/Errors';
import { ABProvider } from '@guardian/ab-react';
import { tests } from '@/shared/model/experiments/abTests';
import { abSwitches } from '@/shared/model/experiments/abSwitches';

interface RendererOpts {
  pageTitle: string;
  requestState: RequestState;
}
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

export const render: (url: string, opts: RendererOpts) => string = (
  url,
  { requestState, pageTitle },
) => {
  const context = {};

  const clientState = clientStateFromRequestStateLocals(requestState);

  const queryString = qs.stringify(requestState.queryParams);

  const location = `${url}${queryString ? `?${queryString}` : ''}`;

  const { abTesting: { mvtId = 0, forcedTestVariants = {} } = {} } =
    clientState;

 
  // Any changes made here must also be made to the hydration in the static webpack bundle
  const react = ReactDOMServer.renderToString(
    <ABProvider
      arrayOfTestObjects={tests}
      abTestSwitches={abSwitches}
      pageIsSensitive={false}
      mvtMaxValue={1000000}
      mvtId={mvtId}
      forcedTestVariants={forcedTestVariants}
    >
      <StaticRouter location={location} context={context}>
        <App {...clientState}></App>
      </StaticRouter>
    </ABProvider>,
  );

  return react;
};

export const renderer = render;
