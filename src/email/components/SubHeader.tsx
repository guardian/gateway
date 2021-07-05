import React from 'react';

import { MjmlSection, MjmlColumn, MjmlText, MjmlDivider } from 'mjml-react';
import { background, text } from '@guardian/src-foundations/palette';

type Props = { children: React.ReactNode };

export const SubHeader = ({ children }: Props) => (
  <>
    <MjmlSection background-color={background.primary} padding-bottom="0">
      <MjmlColumn>
        <MjmlDivider
          border-width="1px"
          border-color="#DCDCDC"
          padding="0 48px"
        />
      </MjmlColumn>
    </MjmlSection>
    <MjmlSection background-color={background.primary} padding="0">
      <MjmlColumn>
        <MjmlText
          padding="4px 48px"
          font-size="20px"
          line-height="20px"
          fontWeight={700}
          fontFamily="GH Guardian Headline, Guardian Egyptian Web, Georgia, serif"
          color={text.primary}
        >
          <span>
            <strong>{children}</strong>
          </span>
        </MjmlText>
      </MjmlColumn>
    </MjmlSection>
  </>
);
