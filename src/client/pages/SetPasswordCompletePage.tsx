import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { ChangePasswordComplete } from '@/client/pages/ChangePasswordComplete';

export const SetPasswordCompletePage = () => {
  const clientState = useClientState();
  const { pageData = {} } = clientState;
  const { returnUrl, email } = pageData;
  return (
    <ChangePasswordComplete
      headerText="Password created"
      email={email}
      returnUrl={returnUrl}
      action="created"
    />
  );
};
