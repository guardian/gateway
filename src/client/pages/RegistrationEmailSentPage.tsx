import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { EmailSent } from '@/client/pages/EmailSent';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { Routes } from '@/shared/model/Routes';

export const RegistrationEmailSentPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData = {}, queryParams, globalMessage = {} } = clientState;
  const { email } = pageData;
  const { emailSentPage } = queryParams;
  const { error } = globalMessage;

  const queryString = addQueryParamsToPath('', queryParams, {
    emailSentPage: true,
  });

  return (
    <EmailSent
      email={email}
      queryString={queryString}
      previousPage={`${Routes.SIGN_IN}`}
      resendEmailAction={`${Routes.REGISTRATION}${Routes.RESEND}`}
      showSuccess={!!emailSentPage}
      errorMessage={error}
      helpInfoBox
    />
  );
};
