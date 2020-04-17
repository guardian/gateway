import React from "react";
import { css, Global } from "@emotion/core";
import { palette } from "@guardian/src-foundations";
import { titlepiece, body } from "@guardian/src-foundations/typography";
import { Route, Switch } from "react-router-dom";
import { fontFaces } from "@/client/lib/fonts";

const h1 = css`
  margin: 0 0 13px 0;
  background-color: ${palette.background.primary};
  color: ${palette.text.primary};
  ${titlepiece.large()}
`;

const p = css`
  ${body.medium()};
`;

export const Main = () => {
  return (
    <main>
      <Global
        styles={css`
          html,
          body {
            ${fontFaces}
          }
        `}
      />
      <h1 css={h1}>Gateway</h1>

      <Switch>
        <Route exact path="/">
          <p css={p}>Gateway</p>
        </Route>
        <Route exact path="/reset">
          <p css={p}>Reset Password</p>
        </Route>
      </Switch>
    </main>
  );
};
