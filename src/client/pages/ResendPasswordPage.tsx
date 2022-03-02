import React, { useEffect } from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { ResetPassword } from '@/client/pages/ResetPassword';
import { MainBodyText } from '@/client/components/MainBodyText';
import { logger } from '@/client/lib/clientSideLogger';

export const ResendPasswordPage = () => {
  const clientState = useClientState();
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
      if (suppliedToken === 'resend') {
        logger.info('Reset password: link expired page shown');
      } else {
        logger.info('Reset password: link expired page shown', undefined, {
          suppliedToken,
        });
      }
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
