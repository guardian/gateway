import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { Registration } from '@/client/pages/Registration';

export const RegistrationPage = () => {
  const clientState = useClientState();
  const { pageData = {}, recaptchaConfig, queryParams } = clientState;
  const { email } = pageData;
  const { recaptchaSiteKey } = recaptchaConfig;

  return (
    <Registration
      email={email}
      recaptchaSiteKey={recaptchaSiteKey}
      queryParams={queryParams}
    />
  );
};
