import React from 'react';

import { MjmlSection, MjmlColumn, MjmlText, MjmlDivider } from 'mjml-react';
import { background, text } from '@guardian/source-foundations';

type Props = { children: React.ReactNode };

export const SubHeader = ({ children }: Props) => (
  <>
    <MjmlSection
      backgroundColor={background.primary}
      padding="24px 24px 0 24px"
    >
      <MjmlColumn>
        <MjmlDivider border-width="1px" border-color="#DCDCDC" padding="0" />
      </MjmlColumn>
    </MjmlSection>
    <MjmlSection
      backgroundColor={background.primary}
      padding="0px 24px 20px 24px"
    >
      <MjmlColumn>
        <MjmlText
          padding="4px 0px"
          fontSize="20px"
          lineHeight="1.15"
          letterSpacing="-0.02pt"
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
