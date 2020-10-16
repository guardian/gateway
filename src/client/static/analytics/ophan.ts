import { record } from '@/client/lib/ophan';

import 'ophan-tracker-js';

export const init = () => {
  record({
    experiences: 'gateway',
    abTestRegister: {
      gateway: {
        variantName: 'gateway',
        complete: false,
      },
    },
  });
};
