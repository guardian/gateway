import React from 'react';
import { css, Global } from '@emotion/react';
import { neutral } from '@guardian/source-foundations';

import { fontFaces } from '@/client/lib/fonts';
import { ClientStateProvider } from '@/client/components/ClientState';
import { ClientState } from '@/shared/model/ClientState';
import { GatewayRoutes } from './routes';

export const App = (props: ClientState) => {
  return (
    <>
      <Global
        styles={css`
          ${fontFaces}
          html {
            height: 100%;
            box-sizing: border-box;
          }
          body {
            height: 100%;
            color: ${neutral[7]};
          }
          #app {
            min-height: 100%;
            display: flex;
            flex-direction: column;
          }
          *,
          *:before,
          *:after {
            box-sizing: inherit;
          }
          /* Badge is hidden for Gateway, because we're using
          the legal text to do this job */
          .grecaptcha-badge {
            visibility: hidden;
          }
        `}
      />
      <ClientStateProvider clientState={props}>
        <GatewayRoutes />
      </ClientStateProvider>
    </>
  );
};
