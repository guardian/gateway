import React, { useContext } from 'react';
import { SignIn } from '@/client/pages/SignIn';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { useRemoveEncryptedEmailParam } from '@/client/lib/hooks/useRemoveEncryptedEmailParam';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';

export const SignInPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const {
    pageData = {},
    globalMessage = {},
    clientHosts,
    queryParams,
    recaptchaConfig,
  } = clientState;
  const { returnUrl, email, geolocation } = pageData;
  const { error } = globalMessage;
  const { oauthBaseUrl } = clientHosts;
  const { recaptchaSiteKey } = recaptchaConfig;
  const queryString = addQueryParamsToPath('', queryParams);
  // we use the encryptedEmail parameter to pre-fill the email field, but then want to remove it from the url
  useRemoveEncryptedEmailParam();
  return (
    <SignIn
      returnUrl={returnUrl}
      email={email}
      error={error}
      oauthBaseUrl={oauthBaseUrl}
      queryString={queryString}
      geolocation={geolocation}
      recaptchaSiteKey={recaptchaSiteKey}
    />
  );
};
