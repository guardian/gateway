import {
	Breadcrumbs,
	BrowserClient,
	Dedupe,
	defaultStackParser,
	getCurrentHub,
	GlobalHandlers,
	HttpContext,
	makeFetchTransport,
} from '@sentry/browser';
import React from 'react';
import { hydrate } from 'react-dom';
import { App } from '@/client/app';
import { ABProvider } from '@/client/components/ABReact';
import { record } from '@/client/lib/ophan';
import type { RoutingConfig } from '@/client/routes';
import { abSwitches } from '@/shared/model/experiments/abSwitches';
import { tests } from '@/shared/model/experiments/abTests';

type Props = {
	routingConfig: RoutingConfig;
};

export const hydrateApp = ({ routingConfig }: Props) => {
	const clientState = routingConfig.clientState;

	const {
		abTesting: { mvtId = 0, forcedTestVariants = {} } = {},
		sentryConfig: { stage, build, dsn },
	} = clientState;

	if (dsn) {
		const client = new BrowserClient({
			dsn,
			environment: stage,
			release: `gateway@${build}`,
			// If you want to log something all the time, wrap your call to
			// Sentry in a new Transaction and set `sampled` to true.
			// An example of this is in clientSideLogger.ts
			sampleRate: 0.2,
			transport: makeFetchTransport,
			stackParser: defaultStackParser,
			integrations: [
				new Breadcrumbs(),
				new GlobalHandlers(),
				new Dedupe(),
				new HttpContext(),
			],
		});

		getCurrentHub().bindClient(client);
	}

	hydrate(
		<ABProvider
			arrayOfTestObjects={tests}
			abTestSwitches={abSwitches}
			pageIsSensitive={false}
			mvtMaxValue={1000000}
			mvtId={mvtId}
			ophanRecord={record}
			forcedTestVariants={forcedTestVariants}
			serverSideTests={{}}
			errorReporter={() => {}}
		>
			<App {...clientState} location={`${routingConfig.location}`} />
		</ABProvider>,
		document.getElementById('app'),
	);
};
