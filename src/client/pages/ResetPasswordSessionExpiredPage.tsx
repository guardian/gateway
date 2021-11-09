import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { ResetPassword } from '@/client/pages/ResetPassword';
import { PageBodyText } from '../components/PageBodyText';

export const ResetPasswordSessionExpiredPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData: { email = '' } = {} } = clientState;

  return (
    <ResetPassword
      email={email}
      headerText="Session timed out"
      buttonText="Send me a link"
    >
      <PageBodyText>
        The link we sent you was valid for 30 minutes and has now expired.
      </PageBodyText>
      <PageBodyText>
        Please enter your email address below and we will send you another link.
      </PageBodyText>
    </ResetPassword>
  );
};
