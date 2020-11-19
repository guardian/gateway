import { Main } from '@/client/main';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { hydrate } from 'react-dom';
import { RoutingConfig } from '@/client/routes';

export const hydrateApp = () => {
  const routingConfig: RoutingConfig = JSON.parse(
    document.getElementById('routingConfig')?.innerHTML ?? '{}',
  );

  const clientState = routingConfig.clientState;

  hydrate(
    <StaticRouter location={`${routingConfig.location}`} context={{}}>
      <Main {...clientState} />
    </StaticRouter>,
    document.getElementById('app'),
  );
};
