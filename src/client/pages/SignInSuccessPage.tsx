import React from 'react';
import { SignInSuccess } from '@/client/pages/SignInSuccess';
import useClientState from '@/client/lib/hooks/useClientState';

export const SignInSuccessPage = () => {
  const clientState = useClientState();
  const { pageData = {} } = clientState;
  const { geolocation, consents = [] } = pageData;

  return <SignInSuccess geolocation={geolocation} consents={consents} />;
};
