import React from 'react';
import { ExternalLink } from '@/client/components/ExternalLink';
import { MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';

type UnsubscribeErrorProps = {
  accountManagementUrl?: string;
};

export const UnsubscribeError = ({
  accountManagementUrl = 'https://manage.theguardian.com',
}: UnsubscribeErrorProps) => {
  return (
    <MainLayout pageHeader="Unsubscribe Error">
      <MainBodyText>Unable to unsubscribe. Please try again.</MainBodyText>
      <MainBodyText>
        If the problem persists, please{' '}
        <ExternalLink
          href={`${accountManagementUrl}/help-centre/contact-us/account`}
        >
          contact our help department
        </ExternalLink>
        .
      </MainBodyText>
      <MainBodyText>
        You can{' '}
        <ExternalLink href={`${accountManagementUrl}/email-prefs`}>
          manage your email preferences
        </ExternalLink>{' '}
        at any time.
      </MainBodyText>
    </MainLayout>
  );
};
