import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { EmailSent } from '@/client/pages/EmailSent';
import { buildQueryParamsString } from '@/shared/lib/queryParams';

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
      previousPage={buildUrl('/signin')}
      resendEmailAction={buildUrl('/register/email-sent/resend')}
      showSuccess={emailSentSuccess}
      errorMessage={error}
      helpInfoBox
    />
  );
};
