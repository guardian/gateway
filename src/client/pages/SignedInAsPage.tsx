import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { SignedInAs } from '@/client/pages/SignedInAs';

export const SignedInAsPage = () => {
  const clientState = useClientState();
  const { pageData = {} } = clientState;
  const {
    email = '',
    continueLink = '',
    signOutLink = '',
    isNativeApp,
  } = pageData;

  return (
    <SignedInAs
      email={email}
      continueLink={continueLink}
      signOutLink={signOutLink}
      isNativeApp={isNativeApp}
    />
  );
};
