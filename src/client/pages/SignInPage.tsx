import React from 'react';
import { SignIn } from '@/client/pages/SignIn';
import useClientState from '@/client/lib/hooks/useClientState';
import { useRemoveEncryptedEmailParam } from '@/client/lib/hooks/useRemoveEncryptedEmailParam';

export const SignInPage = () => {
  const clientState = useClientState();
  const {
    pageData = {},
    globalMessage = {},
    queryParams,
    recaptchaConfig,
  } = clientState;
  const { email, displayRegisterTab = true } = pageData;
  const { error } = globalMessage;
  const { recaptchaSiteKey } = recaptchaConfig;

  // we use the encryptedEmail parameter to pre-fill the email field, but then want to remove it from the url
  useRemoveEncryptedEmailParam();
  return (
    <SignIn
      email={email}
      error={error}
      queryParams={queryParams}
      recaptchaSiteKey={recaptchaSiteKey}
      displayRegisterTab={displayRegisterTab}
    />
  );
};
