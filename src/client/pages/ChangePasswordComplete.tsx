import React from 'react';
import { ExternalLinkButton } from '@/client/components/ExternalLink';
import { buttonStyles, MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';

type ChangePasswordCompleteProps = {
  headerText: string;
  email?: string;
  returnUrl?: string;
};

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
      <ExternalLinkButton
        css={buttonStyles({ halfWidth: true })}
        href={returnUrl}
      >
        Continue to the Guardian
      </ExternalLinkButton>
    </MainLayout>
  );
};
