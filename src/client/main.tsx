import React, { FC } from "react";
import { palette } from "@guardian/src-foundations";

const main = {
  backgroundColor: palette.background.brand.primary,
  color: palette.text.brand.primary
};

type MainProps = {
  title: string
};

export const Main: FC<MainProps> = (props) => {
  return (
    <main css={main}>
      <h1>{props.title}</h1>
    </main>
  );
};

