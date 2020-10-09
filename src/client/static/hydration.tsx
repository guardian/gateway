import { Main } from '@/client/main';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { hydrate } from 'react-dom';
import { RoutingConfig } from '@/client/routes';

export const hydrateApp = () => {
  const routingConfig: RoutingConfig = JSON.parse(
    document.getElementById('routingConfig')?.innerHTML ?? '{}',
  );

  const globalState = routingConfig.globalState;

  hydrate(
    <StaticRouter location={`${routingConfig.location}`} context={{}}>
      <Main {...globalState} />
    </StaticRouter>,
    document.getElementById('app'),
  );
};
