import React from 'react';

import { MjmlSection, MjmlButton, MjmlColumn } from 'mjml-react';
import {
  background,
  brandBackground,
  brandText,
} from '@guardian/source-foundations';

type Props = { children: React.ReactNode; href: string };

export const Button = ({ children, href }: Props) => (
  <MjmlSection background-color={background.primary} padding="0 24px">
    <MjmlColumn>
      <MjmlButton
        backgroundColor={brandBackground.primary}
        color={brandText.anchorPrimary}
        borderRadius="24px"
        href={href}
        align="left"
        padding="22px 0 32px 0"
        fontFamily="Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif"
        fontWeight={700}
        fontSize="17px"
        cssClass="guardian-email-button"
      >
        {children}
      </MjmlButton>
    </MjmlColumn>
  </MjmlSection>
);
