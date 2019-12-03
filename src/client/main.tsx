import React, { FC } from "react";

type MainProps = {
  title: string
};

export const Main: FC<MainProps> = (props) => {
  return (
    <main>
      <h1>{props.title}</h1> 
    </main>
  );
};

