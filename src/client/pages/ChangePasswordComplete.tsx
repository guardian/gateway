import React from 'react';
import { ExternalLinkButton } from '@/client/components/ExternalLink';
import { MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';
import { css } from '@emotion/react';
import { from } from '@guardian/src-foundations/mq';

type ChangePasswordCompleteProps = {
  headerText: string;
  email?: string;
  returnUrl?: string;
};

const buttonStyles = css`
  margin-top: 22px;
  justify-content: center;
  width: 100%;

  ${from.tablet} {
    width: 50%;
  }
`;

export const ChangePasswordComplete = ({
  headerText,
  email,
  returnUrl = 'https://www.theguardian.com/uk',
}: ChangePasswordCompleteProps) => {
  return (
    <MainLayout pageTitle={headerText}>
      {email ? (
        <MainBodyText noMargin>
          The password for <b>{email}</b> was successfully updated.
        </MainBodyText>
      ) : (
        <MainBodyText noMargin>
          The password for your account was successfully updated.
        </MainBodyText>
      )}
      <ExternalLinkButton css={buttonStyles} href={returnUrl}>
        Continue to the Guardian
      </ExternalLinkButton>
    </MainLayout>
  );
};
