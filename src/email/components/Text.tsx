import React from 'react';

import { MjmlSection, MjmlColumn, MjmlText } from 'mjml-react';
import { background, text } from '@guardian/src-foundations/palette';

type Props = { children: React.ReactNode; noPaddingBottom?: boolean };

export const Text = ({ children, noPaddingBottom = false }: Props) => (
  <MjmlSection
    background-color={background.primary}
    padding={noPaddingBottom ? '0 12px' : '0 12px 12px 12px'}
  >
    <MjmlColumn>
      <MjmlText
        padding="0"
        fontSize="17px"
        lineHeight="23px"
        letterSpacing="-2%"
        fontFamily="Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif"
        color={text.primary}
      >
        {children}
      </MjmlText>
    </MjmlColumn>
  </MjmlSection>
);
