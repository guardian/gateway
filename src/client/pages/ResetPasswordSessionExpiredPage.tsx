import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { ResetPassword } from '@/client/pages/ResetPassword';

export const ResetPasswordSessionExpiredPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData: { email = '' } = {} } = clientState;

  return (
    <ResetPassword
      email={email}
      headerText="Session timed out"
      bodyText={`The link we sent you was valid for 30 minutes and has now expired.\nPlease enter your email address below and we will send you another link.`}
      buttonText="Send me a link"
    />
  );
};
