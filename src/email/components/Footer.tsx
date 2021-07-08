import React from 'react';
import { MjmlSection, MjmlColumn, MjmlText } from 'mjml-react';

import { background, text } from '@guardian/src-foundations/palette';
import { Link } from '@/email/components/Link';

export const Footer = () => (
  <MjmlSection background-color={background.secondary} padding="0">
    <MjmlColumn>
      <MjmlText
        color={text.primary}
        font-size="15px"
        lineHeight="20.25px"
        padding="0px 48px 48px 48px"
        fontFamily="GuardianTextSans, Guardian Text Sans Web, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif"
      >
        <p>
          If you received this email by mistake, simply delete it. You
          won&apos;t be subscribed if you don&apos;t click the confirmation
          button above.
        </p>
        <p>
          If you have any queries about this email please contact our customer
          services team at{' '}
          <Link href="mailto:userhelp@theguardian.com">
            userhelp@theguardian.com
          </Link>
          .
        </p>
        <p>
          <strong>Your Data</strong>{' '}
        </p>
        <p>
          To find out what personal data we collect and how we use it, please
          visit our{' '}
          <Link href="https://www.theguardian.com/help/privacy-policy">
            privacy policy
          </Link>
          .
        </p>
        <p>
          <strong>Terms & Conditions</strong>
        </p>
        <p>
          By registering with{' '}
          <Link href="https://www.theguardian.com/">theguardian.com</Link> you
          agreed to abide by our terms of service, as described at{' '}
          <Link href="https://www.theguardian.com/help/terms-of-service">
            https://www.theguardian.com/help/terms-of-service
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
