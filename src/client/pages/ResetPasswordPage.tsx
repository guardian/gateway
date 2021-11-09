import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { ResetPassword } from '@/client/pages/ResetPassword';
import { useLocation } from 'react-router-dom';
import { PageBodyText } from '../components/PageBodyText';

export const ResetPasswordPage = () => {
  const { search } = useLocation();
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData: { email = '' } = {} } = clientState;

  return (
    <ResetPassword
      email={email}
      headerText="Forgotten password"
      buttonText="Reset Password"
      queryString={search}
    >
      <PageBodyText>
        Forgotten or need to set your password? We will email you a link to
        change or set it.
      </PageBodyText>
    </ResetPassword>
  );
};
