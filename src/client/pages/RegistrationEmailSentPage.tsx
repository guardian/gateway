import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { EmailSent } from '@/client/pages/EmailSent';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { Routes } from '@/shared/model/Routes';

export const RegistrationEmailSentPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const {
    pageData = {},
    queryParams,
    globalMessage = {},
    recaptchaConfig,
  } = clientState;
  const { email } = pageData;
  const { emailSentSuccess } = queryParams;
  const { error } = globalMessage;
  const { recaptchaSiteKey } = recaptchaConfig;

  const queryString = addQueryParamsToPath('', queryParams, {
    emailSentSuccess: true,
  });

  return (
    <EmailSent
      email={email}
      queryString={queryString}
      previousPage={`${Routes.SIGN_IN}`}
      resendEmailAction={`${Routes.REGISTRATION}${Routes.EMAIL_SENT}${Routes.RESEND}`}
      showSuccess={emailSentSuccess}
      errorMessage={error}
      recaptchaSiteKey={recaptchaSiteKey}
    />
  );
};
