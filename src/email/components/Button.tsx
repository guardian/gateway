import React from 'react';

import { MjmlButton } from 'mjml-react';
import { brandBackground, brandText } from '@guardian/src-foundations/palette';
import { space } from '@guardian/src-foundations';

type Props = { children: React.ReactNode; href: string };

export const Button = ({ children, href }: Props) => (
  <MjmlButton
    background-color={brandBackground.primary}
    color={brandText.anchorPrimary}
    border-radius="24px"
    href={href}
    align="left"
    padding={`${space[3]}px`}
    fontFamily="GuardianTextSans, Guardian Text Sans Web, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif"
    fontWeight={700}
  >
    {children}
  </MjmlButton>
);
