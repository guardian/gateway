import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { ResetPassword } from '@/client/pages/ResetPassword';
import { PageBodyText } from '../components/PageBodyText';

export const ResendPasswordPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData: { email = '' } = {} } = clientState;

  return (
    <ResetPassword
      email={email}
      headerText="Link expired"
      buttonText="Send me a link"
    >
      <PageBodyText>
        The link you are using has expired. Please enter your email address and
        we will send you a new one.
      </PageBodyText>
    </ResetPassword>
  );
};
