import React from 'react';
import { MjmlSection, MjmlColumn, MjmlText } from 'mjml-react';

import { background, text } from '@guardian/source-foundations';
import { Link } from '@/email/components/Link';

type Props = { mistakeParagraphComponent?: React.ReactNode };

const FooterText = ({
  children,
  noPaddingBottom = false,
}: {
  children?: React.ReactNode;
  noPaddingBottom?: boolean;
}) => (
  <MjmlText
    color={text.primary}
    padding={noPaddingBottom ? '0' : '0 0 10px 0'}
    fontSize="15px"
    fontFamily="Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif"
    lineHeight="1.35"
    letterSpacing="-0.02px"
  >
    {children}
  </MjmlText>
);

export const Footer = ({ mistakeParagraphComponent }: Props) => (
  <MjmlSection padding="0 12px">
    <MjmlColumn
      padding="12px 12px 24px 12px"
      background-color={background.secondary}
    >
      {mistakeParagraphComponent && (
        <FooterText>{mistakeParagraphComponent}</FooterText>
      )}
      <FooterText>
        If you have any queries about why you are receiving this email, please
        contact our customer service team at{' '}
        <Link href="mailto:userhelp@theguardian.com">
          userhelp@theguardian.com
        </Link>
        .
      </FooterText>
      <FooterText noPaddingBottom>
        Guardian News and Media Limited, Kings Place, 90 York Way, London, N1
        9GU, United Kingdom
      </FooterText>
    </MjmlColumn>
  </MjmlSection>
);
