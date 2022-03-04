import { AB } from '@guardian/ab-core';
import { tests } from '@/shared/model/experiments/abTests';
import { abSwitches } from '@/shared/model/experiments/abSwitches';
import { ABTesting } from '@/shared/model/ClientState';
import { record } from '@/client/lib/ophan';

export const init = (abTestingConfig: ABTesting) => {
  const { mvtId, forcedTestVariants } = abTestingConfig;

  // initalise the AB Test Framework with relevant parameters
  const ab = new AB({
    arrayOfTestObjects: tests,
    abTestSwitches: abSwitches,
    pageIsSensitive: false,
    mvtMaxValue: 100000,
    mvtId,
    ophanRecord: record,
    forcedTestVariants,
  });

  // get all runnable tests
  const allRunnableTests = ab.allRunnableTests(tests);
  // track them in ophan
  ab.trackABTests(allRunnableTests);
  // register any impression events
  ab.registerImpressionEvents(allRunnableTests);
  // register any completion events
  ab.registerCompleteEvents(allRunnableTests);

  // add the ab test api to the window so it can be used elsewhere
  // eslint-disable-next-line functional/immutable-data
  window.guardian.abTestApi = ab;
};
