import React from 'react';
import { css, Global } from '@emotion/core';
import { fontFaces } from '@/client/lib/fonts';
import { GlobalStateProvider } from '@/client/components/GlobalState';
import { GlobalState } from '@/shared/model/GlobalState';
import { GatewayRoutes } from './routes';

export const Main = (props: GlobalState) => {
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
      <GlobalStateProvider globalState={props}>
        <GatewayRoutes />
      </GlobalStateProvider>
    </>
  );
};
