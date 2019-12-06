import React, { FC } from "react";
import { css } from "@emotion/core";
import { palette } from "@guardian/src-foundations";
import { titlepiece } from "@guardian/src-foundations/typography";
import { Button } from "@guardian/src-button";

const h1 = css`
  margin: 0 0 13px 0;
  background-color: ${palette.background.brand.primary};
  color: ${palette.text.brand.primary};
  ${titlepiece.large()}
`;

type MainProps = {
  title: string
};

export const Main: FC<MainProps> = (props) => {
  return (
    <main>
      <h1 css={h1}>{props.title}</h1>
      <Button onClick={() => console.log("Button event fired")} >
        Test Button
      </Button>
    </main>
  );
};

