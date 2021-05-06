import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { ResetPassword } from '@/client/components/ResetPassword';
import { useLocation } from 'react-router-dom';

export const ResetPasswordPage = () => {
  const { search } = useLocation();
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData: { email = '' } = {} } = clientState;

  return (
    <ResetPassword
      email={email}
      headerText="Forgotten password"
      bodyText="Forgotten or need to set your password? We will email you a link to change or set it."
      buttonText="Reset Password"
      queryString={search}
    />
  );
};
