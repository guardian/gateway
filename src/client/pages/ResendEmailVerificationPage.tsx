import React from 'react';
import { ResendEmailVerification } from '@/client/pages/ResendEmailVerification';
import useClientState from '@/client/lib/hooks/useClientState';

export const ResendEmailVerificationPage = () => {
  const {
    globalMessage: { success } = {},
    pageData: { email, signInPageUrl } = {},
    recaptchaConfig,
  } = useClientState();

  const { recaptchaSiteKey } = recaptchaConfig;

  return (
    <ResendEmailVerification
      email={email}
      signInPageUrl={signInPageUrl}
      successText={success}
      recaptchaSiteKey={recaptchaSiteKey}
    />
  );
};
