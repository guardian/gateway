import React, { useEffect } from 'react';
import { useAB } from '@guardian/ab-react';
import { css, Global } from '@emotion/core';
import { fontFaces } from '@/client/lib/fonts';
import { ClientStateProvider } from '@/client/components/ClientState';
import { ClientState } from '@/shared/model/ClientState';
import { GatewayRoutes } from './routes';
import { tests } from '@/shared/model/experiments';

export const Main = (props: ClientState) => {
  // TODO: THIS IS JUST FOR TESTING
  const ABTestAPI = useAB();
  useEffect(() => {
    const allRunnableTests = ABTestAPI.allRunnableTests(tests);
    ABTestAPI.registerImpressionEvents(allRunnableTests);
    ABTestAPI.registerCompleteEvents(allRunnableTests);
  }, [ABTestAPI]);

  const firstRunnableTest = ABTestAPI.firstRunnableTest(tests);
  const variantFromRunnable = firstRunnableTest?.variantToRun;
  const testToRun = variantFromRunnable?.test;
  console.log(
    firstRunnableTest,
    variantFromRunnable,
    testToRun,
    testToRun && testToRun({}),
  );

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
            min-height: 100%;
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
