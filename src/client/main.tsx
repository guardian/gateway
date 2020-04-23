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

export const Main = () => {
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
      <Header />
      <main css={main}>
        <Switch>
          <Route exact path="/">
            <p>Gateway</p>
          </Route>
          <Route exact path="/reset">
            <ResetPasswordPage />
          </Route>
          <Route exact path="/reset/sent">
            <ResetSentPage />
          </Route>
        </Switch>
      </main>
      <Footer />
    </>
  );
};
