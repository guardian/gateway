import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { UnsubscribeSuccess } from '@/client/pages/UnsubscribeSuccess';

export const UnsubscribeSuccessPage = () => {
  const clientState = useClientState();
  const { pageData = {} } = clientState;
  const { returnUrl, accountManagementUrl } = pageData;
  return (
    <UnsubscribeSuccess
      returnUrl={returnUrl}
      accountManagementUrl={accountManagementUrl}
    />
  );
};
