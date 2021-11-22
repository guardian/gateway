import React from 'react';
import { MjmlSection, MjmlColumn, MjmlText } from 'mjml-react';

import { background, text } from '@guardian/source-foundations';
import { Link } from '@/email/components/Link';

type Props = { mistakeParagraphComponent?: React.ReactNode };

export const Footer = ({ mistakeParagraphComponent }: Props) => (
  <MjmlSection background-color={background.secondary} padding="0">
    <MjmlColumn>
      <MjmlText
        color={text.primary}
        font-size="15px"
        lineHeight="20.25px"
        padding="0px 48px 48px 48px"
        fontFamily="GuardianTextSans, Guardian Text Sans Web, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif"
      >
        {mistakeParagraphComponent}
        <p>
          If you have any queries about why you are receiving this email, please
          contact our customer service team at{' '}
          <Link href="mailto:userhelp@theguardian.com">
            userhelp@theguardian.com
          </Link>
          .
        </p>
        <p>
          Guardian News and Media Limited, Kings Place, 90 York Way, London, N1
          9GU, United Kingdom
        </p>
      </MjmlText>
    </MjmlColumn>
  </MjmlSection>
);
