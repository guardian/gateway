import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { Welcome } from '@/client/pages/Welcome';

export const WelcomePasswordAlreadySetPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData: { email, fieldErrors = [] } = {} } = clientState;

  return (
    <Welcome
      submitUrl={''}
      email={email}
      fieldErrors={fieldErrors}
      passwordSet={true}
    />
  );
};
