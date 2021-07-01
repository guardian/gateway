import React from 'react';

import { MjmlSection, MjmlColumn, MjmlText } from 'mjml-react';

export const Footer = () => (
  <MjmlSection background-color="#EDEDED" padding="0">
    <MjmlColumn>
      <MjmlText
        color="#999999"
        font-size="10px"
        padding="0 10px"
        fontFamily="GuardianTextSans, Guardian Text Sans Web, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif"
      >
        <p>
          If you have any queries about this email please contact our customer
          services team at{' '}
          <a href="mailto:userhelp@theguardian.com">userhelp@theguardian.com</a>
          .
        </p>
        <p>
          <strong>Your Data</strong> <br /> To find out what personal data we
          collect and how we use it, please visit our{' '}
          <a href="https://www.theguardian.com/help/privacy-policy">
            privacy policy
          </a>
          .
        </p>
        <p>
          <strong>Terms & Conditions</strong> <br /> By registering with
          theguardian.com you agreed to abide by our terms of service, as
          described at{' '}
          <a href="https://www.theguardian.com/help/terms-of-service">
            https://www.theguardian.com/help/terms-of-service
          </a>
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
