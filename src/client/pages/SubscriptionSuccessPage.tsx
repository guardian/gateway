import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { SubscriptionSuccess } from '@/client/pages/SubscriptionSuccess';
import { SubscriptionAction } from '@/shared/lib/subscriptions';

interface Props {
  action: SubscriptionAction;
}

export const SubscriptionSuccessPage = ({ action }: Props) => {
  const clientState = useClientState();
  const { pageData = {} } = clientState;
  const { returnUrl, accountManagementUrl } = pageData;
  return (
    <SubscriptionSuccess
      returnUrl={returnUrl}
      accountManagementUrl={accountManagementUrl}
      action={action}
    />
  );
};
