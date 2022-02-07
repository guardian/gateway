import React from 'react';
import { record } from '@/client/lib/ophan';
import { ABProvider } from '@guardian/ab-react';
import { StaticRouter } from 'react-router-dom/server';
import { hydrate } from 'react-dom';
import { RoutingConfig } from '@/client/routes';
import { App } from '@/client/app';
import { tests } from '@/shared/model/experiments/abTests';
import { abSwitches } from '@/shared/model/experiments/abSwitches';

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
      abTestSwitches={abSwitches}
      pageIsSensitive={false}
      mvtMaxValue={1000000}
      mvtId={mvtId}
      ophanRecord={record}
      forcedTestVariants={forcedTestVariants}
    >
      <StaticRouter location={`${routingConfig.location}`}>
        <App {...clientState} />
      </StaticRouter>
    </ABProvider>,
    document.getElementById('app'),
  );
};
