import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { ResetPassword } from '@/client/pages/ResetPassword';
import { Routes } from '@/shared/model/Routes';
import { useLocation } from 'react-router-dom';

export const WelcomeResendPage = () => {
  const { search } = useLocation();
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData: { email = '' } = {} } = clientState;

  return (
    <ResetPassword
      email={email}
      headerText="Link expired"
      bodyText="The link you are using has expired. Please enter your email address and we'll send you a new one."
      buttonText="Send me a link"
      formActionOverride={`${Routes.WELCOME}${Routes.RESEND}`}
      queryString={search}
    />
  );
};
