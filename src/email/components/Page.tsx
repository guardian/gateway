import React from 'react';

import { Mjml, MjmlHead, MjmlBody, MjmlTitle, MjmlStyle } from 'mjml-react';

type Props = { children: React.ReactNode; title: string };

export const Page = ({ children, title }: Props) => (
  <Mjml>
    <MjmlHead>
      <MjmlTitle>{`${title} | The Guardian`}</MjmlTitle>
      <MjmlStyle inline={true}>
        {/* Adding a 2px white border around the anchor tag creates visual distinction between the 
        button and the outline added to it in web email clients on keyboard focus. As an 'inline'
        MJML style, these styles will only be applied if a '.guardian-email-button' element is present
        on the page. */}
        {`.guardian-email-button a { border: 2px solid #ffffff; border-radius: 21px !important; }`}
      </MjmlStyle>
    </MjmlHead>
    <MjmlBody width={600}>{children}</MjmlBody>
  </Mjml>
);
