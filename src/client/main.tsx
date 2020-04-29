import React from 'react';
import { css, Global } from '@emotion/core';
import { palette } from '@guardian/src-foundations';
import { body } from '@guardian/src-foundations/typography';
import { Route, Switch } from 'react-router-dom';
import { fontFaces } from '@/client/lib/fonts';
import { ResetPasswordPage } from '@/client/pages/ResetPasswordPage';
import { ResetSentPage } from '@/client/pages/ResetSentPage';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { MaxWidth } from '@/client/models/Style';
import { GlobalStateProvider } from '@/client/components/GlobalState';
import { GlobalState } from '@/shared/model/GlobalState';
import { Routes } from '@/shared/model/Routes';
import { GlobalError } from './components/GlobalError';

const p = css`
  color: ${palette.text.primary};
  ${body.medium()};
`;

const main = css`
  flex-grow: 1;
  width: 100%;
  max-width: ${MaxWidth.TABLET}px;
  margin: 0 auto;
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
          p {
            ${p}
          }
          * {
            box-sizing: border-box;
          }
        `}
      />
      <GlobalStateProvider globalState={props}>
        <Header />
        {props.error && <GlobalError error={props.error} />}
        <main css={main}>
          <Switch>
            <Route exact path="/">
              <p>Gateway</p>
            </Route>
            <Route exact path={Routes.RESET}>
              <ResetPasswordPage />
            </Route>
            <Route exact path={Routes.RESET_SENT}>
              <ResetSentPage />
            </Route>
            <Route>
              <p>404</p>
            </Route>
          </Switch>
        </main>
        <Footer />
      </GlobalStateProvider>
    </>
  );
};
