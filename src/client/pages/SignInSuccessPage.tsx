import React, { useContext } from 'react';
import { SignInSuccess } from '@/client/pages/SignInSuccess';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';

export const SignInSuccessPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData = {}, queryParams } = clientState;
  const { geolocation, consents = [] } = pageData;

  return (
    <SignInSuccess
      queryParams={queryParams}
      geolocation={geolocation}
      consents={consents}
    />
  );
};
