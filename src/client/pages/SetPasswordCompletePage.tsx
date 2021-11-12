import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { ChangePasswordComplete } from '@/client/pages/ChangePasswordComplete';

export const SetPasswordCompletePage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
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
