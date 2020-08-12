// method to check if the cmp should show
import { cmp } from '@guardian/consent-management-platform';

// country code helper
import { getCountryCode } from './countryCode';

// loading a js file without types, so ignore ts
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { init as gaInit } from './analytics/ga';

// initalise ophan
import './analytics/ophan';

// initialise google analytics
gaInit();

// load cmp if it should show
(async () => {
  const isInUsa = (await getCountryCode()) === 'US';

  cmp.init({ isInUsa });
})();
