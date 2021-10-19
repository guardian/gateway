import React, { useContext } from 'react';
import { SignIn } from '@/client/pages/SignIn';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';

export const SignInPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData = {} } = clientState;
  const { returnUrl, email } = pageData;

  return <SignIn returnUrl={returnUrl} email={email} />;
};
