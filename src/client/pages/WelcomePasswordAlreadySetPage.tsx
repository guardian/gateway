import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { Welcome } from '@/client/pages/Welcome';

export const WelcomePasswordAlreadySetPage = () => {
  const clientState = useClientState();
  const { pageData: { email, fieldErrors = [] } = {} } = clientState;

  return (
    <Welcome
      submitUrl={''}
      email={email}
      fieldErrors={fieldErrors}
      passwordSet={true}
    />
  );
};
