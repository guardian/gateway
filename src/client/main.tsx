import React from 'react';
import { css, Global } from '@emotion/core';
import { space } from '@guardian/src-foundations';
import { fontFaces } from '@/client/lib/fonts';
import { GlobalError } from '@/client/components/GlobalError';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { MaxWidth } from '@/client/models/Style';
import { GlobalStateProvider } from '@/client/components/GlobalState';
import { GlobalState } from '@/shared/model/GlobalState';
import { Titlepiece } from '@/client/components/Titlepiece';
import { GatewayRoutes } from './routes';

const main = css`
  flex: 1 1 auto;
  padding: ${space[6]}px ${space[3]}px;
  max-width: ${MaxWidth.TABLET}px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: left;
`;

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
            display: flex;
            flex-direction: column;
          }
          * {
            box-sizing: border-box;
          }
        `}
      />
      <GlobalStateProvider globalState={props}>
        <Header />
        <Titlepiece />
        {props.error && <GlobalError error={props.error} />}
        <main css={main}>
          <GatewayRoutes />
        </main>
        <Footer />
      </GlobalStateProvider>
    </>
  );
};
