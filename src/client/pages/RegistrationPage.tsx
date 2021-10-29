import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { Registration } from '@/client/pages/Registration';

export const RegistrationPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData = {}, recaptchaConfig, clientHosts } = clientState;
  const { returnUrl, email, ref: refValue, refViewId } = pageData;
  const { oauthBaseUrl } = clientHosts;
  const { recaptchaSiteKey } = recaptchaConfig;

  return (
    <Registration
      email={email}
      returnUrl={returnUrl}
      refValue={refValue}
      refViewId={refViewId}
      recaptchaSiteKey={recaptchaSiteKey}
      oauthBaseUrl={oauthBaseUrl}
    />
  );
};
