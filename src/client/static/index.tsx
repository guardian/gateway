import { hydrateApp } from '@/client/static/hydration';

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

hydrateApp();

// initalise ophan
ophanInit();

// don't load this if running in cypress
if (!window.Cypress) {
  // load cmp if it should show
  (async () => {
    // if failed to get country code, set to undefined
    // as cmp.init "country" property is type "string | undefined"
    // while "getLocale" returns type "string | null"
    const country = (await getLocale()) || undefined;

    cmp.init({ country });
  })();
}

initGoogleAnalyticsWhenConsented();
