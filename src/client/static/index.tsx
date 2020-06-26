// method to check if the cmp should show
import { shouldShow } from '@guardian/consent-management-platform';

// loading a js file without types, so ignore ts
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { init as gaInit } from './analytics/ga';

// initalise ophan
import './analytics/ophan';

// initialise google analytics
gaInit();

// load cmp if it should show
// use dymamic import to reduce delivered bundle size
if (shouldShow()) {
  import('./cmp');
}
