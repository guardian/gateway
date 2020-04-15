import React from "react";
import { css, Global } from "@emotion/core";
import { palette } from "@guardian/src-foundations";
import {
  titlepiece,
  headline,
  body
} from "@guardian/src-foundations/typography";
import { Link, Route, Switch } from "react-router-dom";
import { Button } from "@guardian/src-button";

const h1 = css`
  margin: 0 0 13px 0;
  background-color: ${palette.background.primary};
  color: ${palette.text.primary};
  ${titlepiece.large()}
`;

const h2 = css`
  ${headline.medium()}
`;

export const Main = () => {
  return (
    <main>
      <Global
        styles={css`
          html,
          body {
            ${body.medium()}
          }
        `}
      />
      <h1 css={h1}>Gateway</h1>
      <h2 css={h2}>Prototype application</h2>
      <Link to="/">Home</Link>
      <Link to="/test">TEST</Link>
      <Switch>
        <Route exact path="/">
          <p>A skeleton app for development into a new gateway application</p>
          <Button onClick={() => console.log("Button event fired")}>
            Test Button
          </Button>
        </Route>
        <Route path="/test">
          <h2 css={h2}>HELLLO!</h2>
        </Route>
      </Switch>
    </main>
  );
};
