import React from 'react';

import { MjmlSection, MjmlColumn, MjmlText, MjmlDivider } from 'mjml-react';
import { background, text } from '@guardian/source-foundations';

type Props = { children: React.ReactNode };

export const SubHeader = ({ children }: Props) => (
  <>
    <MjmlSection
      backgroundColor={background.primary}
      padding="24px 12px 0 12px"
    >
      <MjmlColumn>
        <MjmlDivider border-width="1px" border-color="#DCDCDC" padding="0" />
      </MjmlColumn>
    </MjmlSection>
    <MjmlSection
      backgroundColor={background.primary}
      padding="0px 12px 20px 12px"
    >
      <MjmlColumn>
        <MjmlText
          padding="4px 0px"
          fontSize="20px"
          lineHeight="23px"
          letterSpacing="-2%"
          fontWeight={700}
          fontFamily="Georgia, serif"
          color={text.primary}
        >
          <span>{children}</span>
        </MjmlText>
      </MjmlColumn>
    </MjmlSection>
  </>
);
