import React from 'react';
import { css, Global } from '@emotion/core';
import { fontFaces } from '@/client/lib/fonts';
import { ClientStateProvider } from '@/client/components/ClientState';
import { ClientState } from '@/shared/model/ClientState';
import { GatewayRoutes } from './routes';

export const Main = (props: ClientState) => {
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
