import React from 'react';

import {
  Mjml,
  MjmlBody,
  MjmlButton,
  MjmlColumn,
  MjmlDivider,
  MjmlImage,
  MjmlSection,
  MjmlText,
} from 'mjml-react';

export const Example = () => (
  <Mjml>
    <MjmlBody>
      <MjmlSection background-color="#EDEDED" padding="0">
        <MjmlColumn>
          <MjmlImage
            width="200px"
            align="right"
            src="https://s3-eu-west-1.amazonaws.com/identity-public-email-assets/logo.gh.gif"
          />
        </MjmlColumn>
      </MjmlSection>

      <MjmlSection background-color="#FFFFFF" padding-bottom="0">
        <MjmlColumn>
          <MjmlDivider
            border-width="1px"
            border-color="#DCDCDC"
            padding="0 10px"
          />
        </MjmlColumn>
      </MjmlSection>

      <MjmlSection background-color="#FFFFFF" padding="0">
        <MjmlColumn>
          <MjmlText padding="0 10px" font-size="20px" line-height="20px">
            <span>
              <strong>Sign In</strong>
            </span>
          </MjmlText>
        </MjmlColumn>
      </MjmlSection>

      <MjmlSection background-color="#FFFFFF" padding="0">
        <MjmlColumn>
          <MjmlText padding="0 10px" font-size="17px" line-height="17px">
            <p>Hello,</p>
            <p>You’ve requested a link to sign in to your account.</p>
            <p>Please click the button below to sign in.</p>
          </MjmlText>
        </MjmlColumn>
      </MjmlSection>

      <MjmlSection background-color="#FFFFFF" padding="0">
        <MjmlColumn>
          <MjmlButton
            background-color="#052962"
            color="#FFFFFF"
            border-radius="24px"
            href="https://profile.theguardian.com"
            align="left"
            padding="10px"
          >
            Sign in to The Guardian
          </MjmlButton>
        </MjmlColumn>
      </MjmlSection>

      <MjmlSection background-color="#FFFFFF" padding="0">
        <MjmlColumn>
          <MjmlText padding="0 10px" font-size="17px" line-height="17px">
            <p>
              If you prefer you can{' '}
              <a href="https://profile.theguardian.com">create a password</a>.
            </p>
          </MjmlText>
        </MjmlColumn>
      </MjmlSection>

      <MjmlSection background-color="#EDEDED" padding="0">
        <MjmlColumn>
          <MjmlText color="#999999" font-size="10px" padding="0 10px">
            <p>
              If you have any queries about this email please contact our
              customer services team at{' '}
              <a href="mailto:userhelp@theguardian.com">
                userhelp@theguardian.com
              </a>
              .
            </p>
            <p>
              <strong>Your Data</strong> <br /> To find out what personal data
              we collect and how we use it, please visit our{' '}
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
              Guardian News and Media Limited, Kings Place, 90 York Way London
              N1 9GU, United Kingdom
            </p>
          </MjmlText>
        </MjmlColumn>
      </MjmlSection>
    </MjmlBody>
  </Mjml>
);
