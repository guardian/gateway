// method to check if the cmp should show
import {
  cmp,
  getConsentFor,
  onConsentChange,
} from '@guardian/consent-management-platform';
import { getLocale } from '@guardian/libs';

// loading a js file without types, so ignore ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { init as gaInit } from './analytics/ga';
import { init as ophanInit } from './analytics/ophan';
import { init as isletInit } from './islet';

// initialise source accessibility
import './sourceAccessibility';

const initGoogleAnalyticsWhenConsented = () => {
  onConsentChange((consentState) => {
    if (
      getConsentFor('google-analytics', consentState) &&
      window.ga === undefined
    ) {
      gaInit();
    }
  });
};

// initalise ophan
ophanInit();

// load CMP
if (window.Cypress) {
  cmp.init({ country: 'GB' }); // CI hosted on GithubActions runs in US by default
} else {
  (async () => {
    const country = await getLocale();

    if (country) {
      cmp.init({ country });
    }
  })();
}

initGoogleAnalyticsWhenConsented();

const params = new URLSearchParams(window.location.search);

if (params.has('useIslets')) {
  console.log('init islets');
  isletInit();
} else {
  import('./hydration').then(({ hydrateApp }) => {
    hydrateApp();
  });
}
