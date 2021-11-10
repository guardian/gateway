import React from 'react';
import { ExternalLinkButton } from '@/client/components/ExternalLink';
import { buttonStyles, MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';

type ChangePasswordCompleteProps = {
  headerText: string;
  email?: string;
  returnUrl?: string;
  action: 'created' | 'updated';
};

export const ChangePasswordComplete = ({
  headerText,
  email,
  returnUrl = 'https://www.theguardian.com/uk',
  action,
}: ChangePasswordCompleteProps) => {
  return (
    <MainLayout pageTitle={headerText}>
      {email ? (
        <MainBodyText noMargin>
          The password for <b>{email}</b> was successfully {action}.
        </MainBodyText>
      ) : (
        <MainBodyText noMargin>
          The password for your account was successfully {action}.
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
