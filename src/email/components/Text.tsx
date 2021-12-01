import React from 'react';

import { MjmlSection, MjmlColumn, MjmlText } from 'mjml-react';
import { background, text } from '@guardian/source-foundations';

type Props = { children: React.ReactNode; noPaddingBottom?: boolean };

export const Text = ({ children, noPaddingBottom = false }: Props) => (
  <MjmlSection
    background-color={background.primary}
    padding={noPaddingBottom ? '0 24px' : '0 24px 12px 24px'}
  >
    <MjmlColumn>
      <MjmlText
        padding="0"
        fontSize="17px"
        lineHeight="1.35"
        letterSpacing="-0.02px"
        fontFamily="Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif"
        color={text.primary}
      >
        {children}
      </MjmlText>
    </MjmlColumn>
  </MjmlSection>
);
