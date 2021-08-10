import React from 'react';
import ReactDOM from 'react-dom';
import { record } from '@/client/lib/ophan';
import { ABProvider } from '@guardian/ab-react';
import { BrowserRouter as Router } from 'react-router-dom';
import { RoutingConfig } from '@/client/routes';
import { App } from '@/client/app';
import { tests } from '@/shared/model/experiments/abTests';
import { abSwitches } from '@/shared/model/experiments/abSwitches';

const routingConfig: RoutingConfig = JSON.parse(
  document.getElementById('routingConfig')?.innerHTML ?? '{}',
);

const clientState = routingConfig.clientState;

const { abTesting: { mvtId = 0, forcedTestVariants = {} } = {} } = clientState;

ReactDOM.render(
  <ABProvider
    arrayOfTestObjects={tests}
    abTestSwitches={abSwitches}
    pageIsSensitive={false}
    mvtMaxValue={1000000}
    mvtId={mvtId}
    ophanRecord={record}
    forcedTestVariants={forcedTestVariants}
  >
    <Router>
      <App {...clientState} />
    </Router>
  </ABProvider>,
  document.getElementById('app'),
);
