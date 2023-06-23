import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { SubscriptionSuccess } from '@/client/pages/SubscriptionSuccess';
import { SubscriptionAction } from '@/shared/lib/subscriptions';
import { sendOphanComponentEvent } from '@/client/lib/ophan';

interface Props {
  action: SubscriptionAction;
}

export const SubscriptionSuccessPage = ({ action }: Props) => {
  const clientState = useClientState();
  const { pageData = {} } = clientState;
  const { returnUrl, accountManagementUrl, newsletterId } = pageData;

  if (newsletterId) {
    sendOphanComponentEvent({
      action: 'SUBSCRIBE',
      component: {
        componentType: 'NEWSLETTER_SUBSCRIPTION',
        id: newsletterId,
      },
    });
  }

  return (
    <SubscriptionSuccess
      returnUrl={returnUrl}
      accountManagementUrl={accountManagementUrl}
      action={action}
    />
  );
};
