import React from 'react';

import { MjmlSection, MjmlButton, MjmlColumn } from 'mjml-react';
import {
  background,
  brandBackground,
  brandText,
} from '@guardian/src-foundations/palette';

type Props = { children: React.ReactNode; href: string };

export const Button = ({ children, href }: Props) => (
  <MjmlSection background-color={background.primary} padding="0 50px">
    <MjmlColumn>
      <MjmlButton
        background-color={brandBackground.primary}
        color={brandText.anchorPrimary}
        border-radius="24px"
        href={href}
        align="left"
        padding="12px 0 48px 0"
        fontFamily="GuardianTextSans, Guardian Text Sans Web, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif"
        fontWeight={700}
        fontSize="17px"
      >
        {children}
      </MjmlButton>
    </MjmlColumn>
  </MjmlSection>
);
