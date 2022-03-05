import React from 'react';
import { SignIn } from '@/client/pages/SignIn';
import useClientState from '@/client/lib/hooks/useClientState';
import { Islet } from '@/client/components/Islet';
import { removeEncryptedEmailParam } from '../lib/removeEncryptedEmailParam.importable';

export const SignInPage = () => {
  const clientState = useClientState();
  const {
    pageData = {},
    globalMessage = {},
    clientHosts,
    queryParams,
    recaptchaConfig,
  } = clientState;
  const { returnUrl, email } = pageData;
  const { error } = globalMessage;
  const { oauthBaseUrl } = clientHosts;
  const { recaptchaSiteKey } = recaptchaConfig;

  return (
    <>
      <SignIn
        returnUrl={returnUrl}
        email={email}
        error={error}
        oauthBaseUrl={oauthBaseUrl}
        queryParams={queryParams}
        recaptchaSiteKey={recaptchaSiteKey}
      />
      {/* we use the encryptedEmail parameter to pre-fill the email field, but then want to remove it from the url */}
      <Islet
        name={removeEncryptedEmailParam.name}
        type="script"
        deferUntil="idle"
      />
    </>
  );
};
