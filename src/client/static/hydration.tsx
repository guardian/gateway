import React from 'react';
import { record } from '@/client/lib/ophan';
import { hydrateRoot } from 'react-dom/client';
import { RoutingConfig } from '@/client/routes';
import { App } from '@/client/app';
import { tests } from '@/shared/model/experiments/abTests';
import { abSwitches } from '@/shared/model/experiments/abSwitches';
import {
	BrowserClient,
	breadcrumbsIntegration,
	dedupeIntegration,
	defaultStackParser,
	globalHandlersIntegration,
	makeFetchTransport,
	httpContextIntegration,
	withIsolationScope,
	setCurrentClient,
} from '@sentry/browser';
import { ABProvider } from '@/client/components/ABReact';

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
			transport: makeFetchTransport,
			stackParser: defaultStackParser,
			integrations: [
				breadcrumbsIntegration(),
				globalHandlersIntegration(),
				dedupeIntegration(),
				httpContextIntegration(),
			],
		});

		withIsolationScope(() => {
			setCurrentClient(client);
			client.init();
		});
	}

	hydrateRoot(
		document.getElementById('app')!,
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
	);
};
