import React from 'react';
import { css, Global } from '@emotion/core';
import { palette, space } from '@guardian/src-foundations';
import { body } from '@guardian/src-foundations/typography';
import { Route, Switch } from 'react-router-dom';
import { fontFaces } from '@/client/lib/fonts';
import { ResetPasswordPage } from '@/client/pages/ResetPassword';
import { ResetSentPage } from '@/client/pages/ResetSent';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { MaxWidth } from '@/client/models/Style';
import { GlobalStateProvider } from '@/client/components/GlobalState';
import { GlobalState } from '@/shared/model/GlobalState';
import { Routes } from '@/shared/model/Routes';
import { GlobalError } from '@/client/components/GlobalError';
import { NotFound } from '@/client/pages/NotFound';
import { ChangePasswordPage } from '@/client/pages/ChangePassword';
import { ChangePasswordCompletePage } from '@/client/pages/ChangePasswordComplete';
import { ResendPasswordPage } from '@/client/pages/ResendPassword';
import { Titlepiece } from '@/client/components/Titlepiece';

const p = css`
  color: ${palette.text.primary};
  ${body.medium()};
`;

const main = css`
  flex: 1;
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
        <Titlepiece />
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
            <Route
              exact
              path={`${Routes.CHANGE_PASSWORD}${Routes.CHANGE_PASSWORD_TOKEN}`}
            >
              <ChangePasswordPage />
            </Route>
            <Route path={Routes.CHANGE_PASSWORD_COMPLETE}>
              <ChangePasswordCompletePage />
            </Route>
            <Route exact path={Routes.RESET_RESEND}>
              <ResendPasswordPage />
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
        </main>
        <Footer />
      </GlobalStateProvider>
    </>
  );
};
