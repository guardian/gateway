import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { ResetPassword } from '@/client/pages/ResetPassword';
import { MainBodyText } from '@/client/components/MainBodyText';

export const ResetPasswordPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData: { email = '' } = {}, queryParams } = clientState;

  return (
    <ResetPassword
      email={email}
      headerText="Forgot password"
      buttonText="Reset password"
      queryString={queryParams}
      showNoAccessEmail
    >
      <MainBodyText>
        Forgot your password? Enter your email address and we’ll send you a link
        to create a new one.
      </MainBodyText>
    </ResetPassword>
  );
};
