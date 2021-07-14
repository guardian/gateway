import React, { useContext } from 'react';
import { SignIn } from '@/client/pages/SignIn';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';

export const SignInPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData = {} } = clientState;
  const { returnUrl, fieldErrors, email } = pageData;
  const returnUrlQuery = returnUrl
    ? `?returnUrl=${encodeURIComponent(returnUrl)}`
    : '';

  const errorSummary = fieldErrors?.find((e) => e.field === 'summary')?.message;

  return (
    <SignIn
      queryString={returnUrlQuery}
      errorSummary={errorSummary}
      email={email}
    />
  );
};
