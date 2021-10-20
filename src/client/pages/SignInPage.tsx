import React, { useContext } from 'react';
import { SignIn } from '@/client/pages/SignIn';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';

export const SignInPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData = {}, globalMessage = {} } = clientState;
  const { returnUrl, email } = pageData;
  const { error } = globalMessage;

  return <SignIn returnUrl={returnUrl} email={email} error={error} />;
};
