import React, { useEffect } from 'react';
import { css, Global } from '@emotion/react';
import { fontFaces } from '@/client/lib/fonts';
import { ClientStateProvider } from '@/client/components/ClientState';
import { ClientState } from '@/shared/model/ClientState';
import { GatewayRoutes } from './routes';
import { tests } from '@/shared/model/experiments/abTests';
import { useAB } from '@guardian/ab-react';

export const App = (props: ClientState) => {
  // initalise the AB Test Framework:
  // load the AB Hook
  const ABTestAPI = useAB();

  // use effect to initialise and register events if needed
  useEffect(() => {
    // get all runnable tests
    const allRunnableTests = ABTestAPI.allRunnableTests(tests);
    // track them in ophan
    ABTestAPI.trackABTests(allRunnableTests);
    // register any impression events
    ABTestAPI.registerImpressionEvents(allRunnableTests);
    // register any completion events
    ABTestAPI.registerCompleteEvents(allRunnableTests);
  }, [ABTestAPI]);

  return (
    <>
      <Global
        styles={css`
          ${fontFaces}
          html {
            height: 100%;
          }
          body {
            height: 100%;
          }
          #app {
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          * {
            box-sizing: border-box;
          }
        `}
      />
      <ClientStateProvider clientState={props}>
        <GatewayRoutes />
      </ClientStateProvider>
    </>
  );
};
