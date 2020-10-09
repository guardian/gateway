import { Main } from '@/client/main';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { GlobalState } from '@/shared/model/GlobalState';
import { hydrate } from 'react-dom';

export const hydrateApp = () => {
  const globalState: GlobalState = JSON.parse(
    document.getElementById('globalState')?.innerHTML ?? '{}',
  );
  hydrate(
    <StaticRouter
      location={`${window.location.pathname}${window.location.search}`}
      context={{}}
    >
      <Main {...globalState} />
    </StaticRouter>,
    document.getElementById('app'),
  );
};
