import { ClientState } from '@/shared/model/ClientState';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { App } from '@/client/app';
import { RoutingConfig } from '@/client/routes';
import { getAssets } from '@/server/lib/getAssets';
import { RequestState } from '@/server/models/Express';
import { CaptchaErrors, CsrfErrors } from '@/shared/model/Errors';
import { tests } from '@/shared/model/experiments/abTests';
import { abSwitches } from '@/shared/model/experiments/abSwitches';
import { buildUrl, PathParams } from '@/shared/lib/routeUtils';
import { brandBackground, resets } from '@guardian/source-foundations';
import deepmerge from 'deepmerge';
import { RoutePaths } from '@/shared/model/Routes';
import { PageTitle } from '@/shared/model/PageTitle';
import serialize from 'serialize-javascript';
import Bowser from 'bowser';
import { ABProvider } from '@/client/components/ABReact';

const assets = getAssets();
const legacyAssets = getAssets(true);

// favicon shamefully stolen from dcr
const favicon =
	process.env.NODE_ENV === 'production'
		? 'favicon-32x32.ico'
		: 'favicon-32x32-dev-yellow.ico';

interface RendererOpts {
	pageTitle: PageTitle;
	requestState: RequestState;
}

// for safari 10 and 11 although they support modules, we want then to use the legacy bundle
// as the modern bundle is not compatible with these browser versions
const isSafari10Or11 = (browser: Bowser.Parser.Details): boolean =>
	browser.name === 'Safari' &&
	(!!browser.version?.includes('10.') || !!browser.version?.includes('11.'));

const getScriptTags = (isSafari10Or11: boolean): string => {
	if (isSafari10Or11) {
		return `
      <script src="/${legacyAssets.runtime}" defer></script>
      <script src="/${legacyAssets.vendors}" defer></script>
      <script src="/${legacyAssets.main}" defer></script>
    `;
	}
	return `
    <script type="module" src="/${assets.runtime}" defer></script>
    <script type="module" src="/${assets.vendors}" defer></script>
    <script type="module" src="/${assets.main}" defer></script>

    <script nomodule src="/${legacyAssets.runtime}" defer></script>
    <script nomodule src="/${legacyAssets.vendors}" defer></script>
    <script nomodule src="/${legacyAssets.main}" defer></script>
  `;
};

const clientStateFromRequestStateLocals = ({
	csrf,
	globalMessage,
	pageData,
	queryParams,
	abTesting,
	clientHosts,
	recaptchaConfig,
	sentryConfig,
}: RequestState): ClientState => {
	const clientState: ClientState = {
		csrf,
		globalMessage,
		pageData,
		abTesting,
		clientHosts,
		recaptchaConfig,
		queryParams,
		sentryConfig,
	};

	// checking if csrf error exists in query params, and attaching it to the
	// forms field errors
	if (queryParams.csrfError) {
		return {
			...clientState,
			pageData: {
				...clientState.pageData,
				formError: CsrfErrors.CSRF_ERROR,
			},
		};
	}

	// checking if recaptcha error exists in query params, and attaching it to the
	// forms field errors
	if (queryParams.recaptchaError) {
		return deepmerge<ClientState>(clientState, {
			pageData: {
				formError: CaptchaErrors.GENERIC,
			},
		});
	}

	return clientState;
};

export const renderer: <P extends RoutePaths>(
	url: P,
	opts: RendererOpts,
	tokenisationParams?: PathParams<P>,
) => string = (url, { requestState, pageTitle }, tokenisationParams) => {
	const clientState = clientStateFromRequestStateLocals(requestState);

	const location = buildUrl(url, tokenisationParams);

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
			serverSideTests={{}}
			errorReporter={() => { }}
			ophanRecord={() => { }}
		>
			<App {...clientState} location={location}></App>
		</ABProvider>,
	);

	const routingConfig: RoutingConfig = {
		clientState,
		location,
	};

	const scriptTags = getScriptTags(isSafari10Or11(requestState.browser));

	return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset='utf-8' />
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="${brandBackground.primary}" />
        <link rel="icon" href="https://static.guim.co.uk/images/${favicon}">
        <title>${pageTitle} | The Guardian</title>

        <script src="https://assets.guim.co.uk/polyfill.io/v3/polyfill.min.js?features=es2015%2Ces2016%2Ces2017%2Ces2018%2Ces2019%2Ces2020%2Ces2021%2Ces2022%2Cfetch%2CglobalThis%2CURLSearchParams" defer></script>
        ${scriptTags}

        <script id="routingConfig" type="application/json">${serialize(
		routingConfig,
		{ isJSON: true },
	)}</script>
        <style>${resets.defaults}</style>
      </head>
      <body style="margin:0">
        <div id="app">${react}</div>
      </body>
    </html>
  `;
};
