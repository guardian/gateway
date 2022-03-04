import React from 'react';
import { SignIn } from '@/client/pages/SignIn';
import useClientState from '@/client/lib/hooks/useClientState';
import { useRemoveEncryptedEmailParam } from '@/client/lib/hooks/useRemoveEncryptedEmailParam';

export const SignInPage = () => {
  const clientState = useClientState();
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

  // we use the encryptedEmail parameter to pre-fill the email field, but then want to remove it from the url
  useRemoveEncryptedEmailParam();
  return (
    <SignIn
      returnUrl={returnUrl}
      email={email}
      error={error}
      oauthBaseUrl={oauthBaseUrl}
      queryParams={queryParams}
      geolocation={geolocation}
      recaptchaSiteKey={recaptchaSiteKey}
    />
  );
};
