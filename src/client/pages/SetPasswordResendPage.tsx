import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { ResetPassword } from '@/client/pages/ResetPassword';
import { Routes } from '@/shared/model/Routes';
import { useLocation } from 'react-router-dom';
import { PageBodyText } from '@/client/components/PageBodyText';

export const SetPasswordResendPage = () => {
  const { search } = useLocation();
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData: { email = '' } = {} } = clientState;

  return (
    <ResetPassword
      email={email}
      headerText="Link expired"
      buttonText="Send me a link"
      formActionOverride={`${Routes.SET_PASSWORD}${Routes.RESEND}`}
      queryString={search}
    >
      <PageBodyText>
        The link you are using has expired. Please enter your email address and
        we will send you a new one.
      </PageBodyText>
    </ResetPassword>
  );
};
