import React, { useContext, useEffect } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { ResetPassword } from '@/client/pages/ResetPassword';
import { MainBodyText } from '@/client/components/MainBodyText';
import { buildUrl } from '@/shared/lib/routeUtils';
import { logger } from '@/client/lib/clientSideLogger';

export const SetPasswordSessionExpiredPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const {
    pageData: { email = '' } = {},
    queryParams,
    recaptchaConfig,
  } = clientState;

  const { recaptchaSiteKey } = recaptchaConfig;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // logging to debug scenarios where users are seeing an expired session token page with a supposedly valid token.
      logger.info('Set password: session expired page shown');
    }
  }, []);

  return (
    <ResetPassword
      email={email}
      headerText="Session timed out"
      buttonText="Send me a link"
      formActionOverride={buildUrl('/set-password/resend')}
      queryString={queryParams}
      emailInputLabel="Email address"
      recaptchaSiteKey={recaptchaSiteKey}
      formPageTrackingName="set-password-session-expired"
    >
      <MainBodyText>
        The link we sent you was valid for 30 minutes and it has now expired.
      </MainBodyText>
      <MainBodyText>
        To receive a new link, please enter your email address below.
      </MainBodyText>
    </ResetPassword>
  );
};
