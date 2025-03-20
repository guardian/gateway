import { hydrateApp } from '@/client/static/hydration';

import { RoutingConfig } from '@/client/routes';

import { init as ophanInit } from '@/client/static/analytics/ophan';

// initialise source accessibility
import '@/client/static/sourceAccessibility';

const routingConfig: RoutingConfig = JSON.parse(
	document.getElementById('routingConfig')?.innerHTML ?? '{}',
);

hydrateApp({ routingConfig });

// initalise ophan
ophanInit();
