import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { ChangeEmailComplete } from '@/client/pages/ChangeEmailComplete';

export const ChangeEmailCompletePage = () => {
  const clientState = useClientState();
  const { pageData = {} } = clientState;
  const { returnUrl, accountManagementUrl } = pageData;
  return (
    <ChangeEmailComplete
      returnUrl={returnUrl}
      accountManagementUrl={accountManagementUrl}
    />
  );
};
