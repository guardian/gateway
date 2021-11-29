import React from 'react';
import { MjmlSection, MjmlColumn, MjmlText } from 'mjml-react';

import { background, text } from '@guardian/source-foundations';
import { Link } from '@/email/components/Link';

type Props = { mistakeParagraphComponent?: React.ReactNode };

const FooterText = ({ children }: { children?: React.ReactNode }) => (
  <MjmlText
    color={text.primary}
    padding="0 0 10px 0"
    fontSize="15px"
    fontFamily="Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif"
    lineHeight="20.25px"
    letterSpacing="-2%"
  >
    {children}
  </MjmlText>
);

export const Footer = ({ mistakeParagraphComponent }: Props) => (
  <MjmlSection
    background-color={background.secondary}
    padding="16px 12px 56px 12px"
    fullWidth
  >
    <MjmlColumn>
      <FooterText>{mistakeParagraphComponent}</FooterText>
      <FooterText>
        If you have any queries about why you are receiving this email, please
        contact our customer service team at{' '}
        <Link href="mailto:userhelp@theguardian.com">
          userhelp@theguardian.com
        </Link>
        .
      </FooterText>
      <FooterText>
        Guardian News and Media Limited, Kings Place, 90 York Way, London, N1
        9GU, United Kingdom
      </FooterText>
    </MjmlColumn>
  </MjmlSection>
);
