import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { EmailSent } from '@/client/pages/EmailSent';
import { buildQueryParamsString } from '@/shared/lib/queryParams';
import { Routes } from '@/shared/model/Routes';
import { buildUrl } from '@/shared/lib/routeUtils';

export const RegistrationEmailSentPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData = {}, queryParams, globalMessage = {} } = clientState;
  const { email } = pageData;
  const { emailSentSuccess } = queryParams;
  const { error } = globalMessage;

  const queryString = buildQueryParamsString(queryParams, {
    emailSentSuccess: true,
  });

  return (
    <EmailSent
      email={email}
      queryString={queryString}
      previousPage={buildUrl(`${Routes.SIGN_IN}`)}
      resendEmailAction={buildUrl(`${Routes.REGISTRATION}${Routes.RESEND}`)}
      showSuccess={emailSentSuccess}
      errorMessage={error}
      helpInfoBox
    />
  );
};
