import React from 'react';
import { record } from '@/client/lib/ophan';
import { ABProvider } from '@guardian/ab-react';
import { StaticRouter } from 'react-router-dom';
import { hydrate } from 'react-dom';
import { RoutingConfig } from '@/client/routes';
import { Main } from '@/client/main';
import { tests } from '@/shared/model/experiments/abTests';
import { switches } from '@/shared/model/experiments/abSwitches';

export const hydrateApp = () => {
  const routingConfig: RoutingConfig = JSON.parse(
    document.getElementById('routingConfig')?.innerHTML ?? '{}',
  );

  const clientState = routingConfig.clientState;

  const { abTesting: { mvtId = 0, forcedTestVariants = {} } = {} } =
    clientState;

  hydrate(
    <ABProvider
      arrayOfTestObjects={tests}
      abTestSwitches={switches}
      pageIsSensitive={false}
      mvtMaxValue={1000000}
      mvtId={mvtId}
      ophanRecord={record}
      forcedTestVariants={forcedTestVariants}
    >
      <StaticRouter location={`${routingConfig.location}`} context={{}}>
        <Main {...clientState} />
      </StaticRouter>
    </ABProvider>,
    document.getElementById('app'),
  );
};
