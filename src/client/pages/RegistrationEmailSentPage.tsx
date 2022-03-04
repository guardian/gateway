import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { EmailSent } from '@/client/pages/EmailSent';
import { buildQueryParamsString } from '@/shared/lib/queryParams';

import { buildUrl, buildUrlWithQueryParams } from '@/shared/lib/routeUtils';

export const RegistrationEmailSentPage = () => {
  const clientState = useClientState();
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

  const queryString = buildQueryParamsString(queryParams, {
    emailSentSuccess: true,
  });

  return (
    <EmailSent
      email={email}
      queryString={queryString}
      previousPage={buildUrlWithQueryParams('/signin', {}, queryParams)}
      resendEmailAction={buildUrl('/register/email-sent/resend')}
      showSuccess={emailSentSuccess}
      errorMessage={error}
      recaptchaSiteKey={recaptchaSiteKey}
      formTrackingName="register-resend"
    />
  );
};
