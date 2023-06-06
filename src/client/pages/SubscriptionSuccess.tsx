import React from 'react';
import { ExternalLink } from '@/client/components/ExternalLink';
import { MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';
import {
  SubscriptionAction,
  subscriptionActionName,
} from '@/shared/lib/subscriptions';

type UnsubscribeSuccessProps = {
  action: SubscriptionAction;
  returnUrl?: string;
  accountManagementUrl?: string;
};

export const SubscriptionSuccess = ({
  action,
  returnUrl = 'https://www.theguardian.com',
  accountManagementUrl = 'https://manage.theguardian.com',
}: UnsubscribeSuccessProps) => {
  return (
    <MainLayout pageHeader={`${subscriptionActionName(action)} Confirmation`}>
      <MainBodyText>
        You have been {action}d. These changes can take up to 24 hours to take
        effect.
      </MainBodyText>
      <MainBodyText>
        <ExternalLink href={`${accountManagementUrl}/email-prefs`}>
          Manage your email preferences
        </ExternalLink>
      </MainBodyText>
      <MainBodyText>
        <ExternalLink href={returnUrl}>Continue to the Guardian</ExternalLink>
      </MainBodyText>
    </MainLayout>
  );
};
