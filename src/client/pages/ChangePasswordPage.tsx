import React, { useContext } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { Routes } from '@/shared/model/Routes';
import { ChangePassword } from '@/client/pages/ChangePassword';

export const ChangePasswordPage = () => {
  const { search } = useLocation();
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData: { email = '', fieldErrors = [] } = {} } = clientState;
  const { token } = useParams<{ token: string }>();

  return (
    <ChangePassword
      submitUrl={`${Routes.CHANGE_PASSWORD}/${token}${search}`}
      email={email}
      fieldErrors={fieldErrors}
      idapiBaseUrl={clientState.clientHosts.idapiBaseUrl}
    />
  );
};
