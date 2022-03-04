import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { ChangePasswordComplete } from '@/client/pages/ChangePasswordComplete';

export const ChangePasswordCompletePage = () => {
  const clientState = useClientState();
  const { pageData = {} } = clientState;
  const { returnUrl, email } = pageData;
  return (
    <ChangePasswordComplete
      headerText="Password updated"
      email={email}
      returnUrl={returnUrl}
      action="updated"
    />
  );
};
