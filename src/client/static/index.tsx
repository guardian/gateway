import { hydrateApp } from '@/client/static/hydration';

// method to check if the cmp should show
import { cmp, getLocale } from '@guardian/libs';
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

// load CMP
if (!routingConfig.clientState.pageData?.isNativeApp) {
	if (window.Cypress) {
		cmp.init({ country: 'GB' }); // CI hosted on GithubActions runs in US by default
	} else {
		void (async () => {
			const country = await getLocale();

			if (country) {
				cmp.init({ country });
			}
		})();
	}
}
