import React from 'react';

import { MjmlSection, MjmlColumn, MjmlText } from 'mjml-react';
import { brandBackground, text } from '@guardian/src-foundations/palette';

type Props = { children: React.ReactNode };

export const Text = ({ children }: Props) => (
  <MjmlSection background-color={brandBackground} padding="0">
    <MjmlColumn>
      <MjmlText
        padding="0 48px"
        font-size="17px"
        line-height="22.95px"
        fontFamily="GuardianTextSans, Guardian Text Sans Web, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif"
        color={text.primary}
      >
        {children}
      </MjmlText>
    </MjmlColumn>
  </MjmlSection>
);
