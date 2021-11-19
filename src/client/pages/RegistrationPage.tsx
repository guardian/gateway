import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { Registration } from '@/client/pages/Registration';

export const RegistrationPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
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
      queryString={queryParams}
    />
  );
};
