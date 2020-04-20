import React, { FormEvent } from 'react';
import { css, Global } from '@emotion/core';
import { palette, brand, space } from '@guardian/src-foundations';
import { body } from '@guardian/src-foundations/typography';
import { Route, Switch } from 'react-router-dom';
import { fontFaces } from '@/client/lib/fonts';
import { GuardianRoundel } from '@/client/components/GuardianRoundel';

const p = css`
  color: ${palette.text.primary};
  ${body.medium()};
`;

const header = css`
  display: flex;
  justify-content: end;
  padding: ${space[1]}px ${space[3]}px;
  background-color: ${brand[400]};
`;

const footer = css`
  background-color: ${brand[400]};
`;

export const Main = () => {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(e);
  };

  return (
    <>
      <header css={header}>
        <GuardianRoundel />
      </header>
      <main>
        <Global
          styles={css`
            html,
            body {
              ${fontFaces}
            }
          `}
        />
        <Switch>
          <Route exact path="/">
            <p css={p}>Gateway</p>
          </Route>
          <Route exact path="/reset">
            <p css={p}>Reset Password</p>
            <form method="post" action="/reset" onSubmit={submit}>
              <input name="email" type="text"></input>
              <input type="submit" value="submit" />
            </form>
          </Route>
          <Route exact path="/reset/sent">
            <p css={p}>Testing form submit</p>
          </Route>
        </Switch>
      </main>
      <footer css={footer}></footer>
    </>
  );
};
