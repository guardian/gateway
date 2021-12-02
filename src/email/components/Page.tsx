import React from 'react';

import { Mjml, MjmlHead, MjmlBody, MjmlTitle } from 'mjml-react';

type Props = { children: React.ReactNode; title: string };

export const Page = ({ children, title }: Props) => (
  <Mjml>
    <MjmlHead>
      <MjmlTitle>{`${title} | The Guardian`}</MjmlTitle>
    </MjmlHead>
    <MjmlBody width={600}>{children}</MjmlBody>
  </Mjml>
);
