import React, { FC } from "react";
import { css, Global } from "@emotion/core";
import { palette } from "@guardian/src-foundations";
import {
  titlepiece,
  headline,
  body
} from "@guardian/src-foundations/typography";
import { Button } from "@guardian/src-button";

const h1 = css`
  margin: 0 0 13px 0;
  background-color: ${palette.background.brand.primary};
  color: ${palette.text.brand.primary};
  ${titlepiece.large()}
`;

const h2 = css`
  ${headline.medium()}
`;

type MainProps = {
  title: string;
};

export const Main: FC<MainProps> = props => {
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
      <h1 css={h1}>{props.title}</h1>
      <h2 css={h2}>Prototype application</h2>
      <p>A skeleton app for development into a new profile application</p>
      <Button onClick={() => console.log("Button event fired")}>
        Test Button
      </Button>
    </main>
  );
};
