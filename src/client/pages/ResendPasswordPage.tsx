import React, { useContext, useEffect } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { ResetPassword } from '@/client/pages/ResetPassword';
import { MainBodyText } from '@/client/components/MainBodyText';
import { logger } from '@/client/lib/clientSideLogger';

export const ResendPasswordPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const {
    pageData: { email = '' } = {},
    queryParams,
    recaptchaConfig,
  } = clientState;

  const { recaptchaSiteKey } = recaptchaConfig;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const suppliedToken = window.location.pathname.split('/').pop();
      // logging to debug scenarios where users are seeing an invalid token page with a supposedly valid token.
      logger.info(
        suppliedToken === 'resend'
          ? 'Reset password: link expired page shown'
          : `Reset password: link expired page shown with token: ${suppliedToken}`,
      );
    }
  }, []);

  return (
    <ResetPassword
      email={email}
      headerText="Link expired"
      buttonText="Send me a link"
      queryString={queryParams}
      emailInputLabel="Email address"
      showRecentEmailSummary
      recaptchaSiteKey={recaptchaSiteKey}
      formPageTrackingName="reset-password-link-expired"
    >
      <MainBodyText>This link has expired.</MainBodyText>
      <MainBodyText>
        To receive a new link, please enter your email address below.
      </MainBodyText>
    </ResetPassword>
  );
};
