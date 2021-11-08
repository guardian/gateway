import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { EmailSent } from '@/client/pages/EmailSent';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { Routes } from '@/shared/model/Routes';

export const RegistrationEmailSentPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData = {}, queryParams } = clientState;
  const { email } = pageData;

  const queryString = addQueryParamsToPath('', queryParams);

  return (
    <EmailSent
      email={email}
      queryString={queryString}
      previousPage={`${Routes.SIGN_IN}`}
      resendEmailAction={`${Routes.REGISTRATION}${Routes.RESEND}`}
    />
  );
};
