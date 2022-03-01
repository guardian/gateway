// method to check if the cmp should show
import {
  cmp,
  getConsentFor,
  onConsentChange,
} from '@guardian/consent-management-platform';
import { getLocale } from '@guardian/libs';
import { loadableReady } from '@loadable/component';

import { init as ophanInit } from './analytics/ophan';
import { init as sourceAccessibilityInit } from './sourceAccessibility';

/**
 * allows us to define public path dynamically
 * dynamic imports will use this as the base to find their assets
 * https://webpack.js.org/guides/public-path/#on-the-fly
 */
__webpack_public_path__ = '/gateway-static/';

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

loadableReady(() => {
  sourceAccessibilityInit();

  const params = new URLSearchParams(window.location.search);

  if (params.has('useIslets')) {
    console.log('init islets');
    import('./islet').then(({ init }) => {
      init();
    });
  } else {
    import('./hydration').then(({ hydrateApp }) => {
      hydrateApp();
    });
  }
});
