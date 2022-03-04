/* eslint-disable functional/immutable-data */
import { loadableReady } from '@loadable/component';
import {
  cmp,
  getConsentFor,
  onConsentChange,
} from '@guardian/consent-management-platform';
import { getLocale } from '@guardian/libs';
import { RoutingConfig } from '@/shared/model/RoutingConfig';
import { defaultClientState } from '@/shared/model/ClientState';
import { init as ophanInit } from './analytics/ophan';
import { init as sourceAccessibilityInit } from './sourceAccessibility';

/**
 * allows us to define public path dynamically
 * dynamic imports will use this as the base to find their assets
 * https://webpack.js.org/guides/public-path/#on-the-fly
 */
__webpack_public_path__ = '/gateway-static/';

const setupConfig = (): RoutingConfig => {
  const routingConfigElement = document.getElementById('routingConfig');

  const routingConfig: RoutingConfig = routingConfigElement
    ? JSON.parse(routingConfigElement.innerHTML)
    : {
        clientState: defaultClientState,
        location: `${window.location.pathname}${window.location.search}`,
      };

  if (!window.guardian) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.guardian = {};
  }

  window.guardian.routingConfig = routingConfig;

  return routingConfig;
};

const initGoogleAnalyticsWhenConsented = () => {
  onConsentChange((consentState) => {
    if (
      getConsentFor('google-analytics', consentState) &&
      window.ga === undefined
    ) {
      // loading a js file without types, so use ts-ignore
      // also uses dynamic import to load ga only if required
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      import('./analytics/ga').then(({ init }) => init());
    }
  });
};

// load CMP
if (window.Cypress) {
  cmp.init({ country: 'GB' }); // CI hosted on GithubActions runs in US by default
} else {
  (async () => {
    const country = await getLocale();

    if (country) {
      cmp.init({ country });
    }

    initGoogleAnalyticsWhenConsented();
    ophanInit();
  })();
}

loadableReady(async () => {
  const config = setupConfig();

  // only initialise ab testing api if there are any tests to run
  if (config.clientState.abTesting.hasParticipations) {
    const { init: abInit } = await import('./abTesting');
    abInit(config.clientState.abTesting);
  }

  sourceAccessibilityInit();

  const params = new URLSearchParams(window.location.search);

  if (params.has('useIslets')) {
    console.log('init islets');
    const { init: isletInit } = await import('./islet');
    isletInit();
  } else {
    const { hydrateApp } = await import('./hydration');
    hydrateApp(config);
  }
});
