import React, { useContext } from 'react';
import { ResendEmailVerification } from '@/client/pages/ResendEmailVerification';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';

export const ResendEmailVerificationPage = () => {
  const {
    globalMessage: { success } = {},
    pageData: { email, signInPageUrl } = {},
    recaptchaConfig: { recaptchaSiteKey },
  } = useContext<ClientState>(ClientStateContext);

  return (
    <ResendEmailVerification
      email={email}
      signInPageUrl={signInPageUrl}
      successText={success}
      recaptchaSiteKey={recaptchaSiteKey}
    />
  );
};
