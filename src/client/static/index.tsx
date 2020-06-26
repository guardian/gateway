// loading a js file without types, so ignore ts
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { init as gaInit } from './analytics/ga';

// load cmp
import './cmp';

// initalise ophan
import './analytics/ophan';

// initialise google analytics
gaInit();
