import React from 'react';

import { MjmlSection, MjmlButton, MjmlColumn } from 'mjml-react';
import {
  background,
  brandBackground,
  brandText,
} from '@guardian/source-foundations';

type Props = { children: React.ReactNode; href: string };

export const Button = ({ children, href }: Props) => (
  <MjmlSection background-color={background.primary} padding="0 12px">
    <MjmlColumn>
      <MjmlButton
        backgroundColor={brandBackground.primary}
        color={brandText.anchorPrimary}
        borderRadius="24px"
        href={href}
        align="left"
        padding="22px 0 48px 0"
        fontFamily="Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif"
        fontWeight={700}
        fontSize="17px"
      >
        {children}
      </MjmlButton>
    </MjmlColumn>
  </MjmlSection>
);
