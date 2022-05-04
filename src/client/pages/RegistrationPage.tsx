import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { Registration } from '@/client/pages/Registration';

export const RegistrationPage = () => {
  const clientState = useClientState();
  const {
    pageData = {},
    recaptchaConfig,
    clientHosts,
    queryParams,
  } = clientState;
  const { returnUrl, email } = pageData;
  const { oauthBaseUrl } = clientHosts;
  const { recaptchaSiteKey } = recaptchaConfig;

  return (
    <Registration
      email={email}
      returnUrl={returnUrl}
      recaptchaSiteKey={recaptchaSiteKey}
      oauthBaseUrl={oauthBaseUrl}
      queryParams={queryParams}
    />
  );
};
