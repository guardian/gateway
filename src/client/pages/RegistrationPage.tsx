import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { Registration } from '@/client/pages/Registration';

export const RegistrationPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData = {} } = clientState;
  const { returnUrl, email, ref: refValue, refViewId } = pageData;
  return (
    <Registration
      email={email}
      returnUrl={returnUrl}
      refValue={refValue}
      refViewId={refViewId}
    />
  );
};
