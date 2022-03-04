import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { ResetPassword } from '@/client/pages/ResetPassword';
import { MainBodyText } from '@/client/components/MainBodyText';

export const ResetPasswordPage = () => {
  const clientState = useClientState();
  const {
    pageData: { email = '' } = {},
    queryParams,
    recaptchaConfig,
  } = clientState;
  const { recaptchaSiteKey } = recaptchaConfig;

  return (
    <ResetPassword
      email={email}
      headerText="Forgot password"
      buttonText="Reset password"
      queryString={queryParams}
      showNoAccessEmail
      recaptchaSiteKey={recaptchaSiteKey}
      formPageTrackingName="forgot-password"
    >
      <MainBodyText>
        Forgot your password? Enter your email address and we’ll send you a link
        to create a new one.
      </MainBodyText>
    </ResetPassword>
  );
};
