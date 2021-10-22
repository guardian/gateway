import React, { useContext } from 'react';
import { SignIn } from '@/client/pages/SignIn';
import { useLocation } from 'react-router-dom';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';

export const SignInPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData = {} } = clientState;
  const { returnUrl, email } = pageData;
  const { pathname, search } = useLocation();
  // we use the encryptedEmail parameter to pre-fill the email field, but then want to remove it from the url
  if (typeof window !== 'undefined') {
    const qs = search.replace(/encryptedEmail=[^&]*[&]?/, '');
    window.history.replaceState(null, '', `${pathname}${qs}`);
  }
  return <SignIn returnUrl={returnUrl} email={email} />;
};
