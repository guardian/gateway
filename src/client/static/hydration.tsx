import React from 'react';
import { record } from '@/client/lib/ophan';
import { ABTest } from '@guardian/ab-core';
import { ABProvider } from '@guardian/ab-react';
import { StaticRouter } from 'react-router-dom';
import { hydrate } from 'react-dom';
import { RoutingConfig } from '@/client/routes';
import { Main } from '@/client/main';

// TODO: THIS IS JUST FOR TESTING
const abTestTest: ABTest = {
  id: 'AbTestTest', // This ID must match the Server Side AB Test
  start: '2020-05-20',
  expiry: '2020-12-01', // Remember that the server side test expiry can be different
  author: 'anemailaddress@theguardian.com',
  description: 'This Test',
  audience: 0.5, // 0.01% (1 is 100%)
  audienceOffset: 0, // 50% (1 is 100%). Prevent overlapping with other tests.
  successMeasure: 'It works',
  audienceCriteria: 'Everyone',
  idealOutcome: 'It works',
  showForSensitive: true, // Should this A/B test run on sensitive articles?
  canRun: () => true, // Check for things like user or page sections
  variants: [
    {
      id: 'control',
      test: (): void => {
        console.log('control');
      }, // You can define what you want your variant to do in here or use the isUserInVariant API
    },
    {
      id: 'variant',
      test: (): string => {
        console.log('variant');
        return 'variant';
      },
    },
  ],
};

export const tests = [abTestTest];

export const hydrateApp = () => {
  const routingConfig: RoutingConfig = JSON.parse(
    document.getElementById('routingConfig')?.innerHTML ?? '{}',
  );

  const clientState = routingConfig.clientState;

  hydrate(
    // TODO: THIS IS JUST FOR TESTING
    <ABProvider
      arrayOfTestObjects={tests}
      abTestSwitches={{
        ...{ abAbTestTest: true },
      }}
      pageIsSensitive={false}
      mvtMaxValue={1000000}
      mvtId={1}
      ophanRecord={record}
    >
      <StaticRouter location={`${routingConfig.location}`} context={{}}>
        <Main {...clientState} />
      </StaticRouter>
    </ABProvider>,
    document.getElementById('app'),
  );
};
