import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { ResetPassword } from '@/client/pages/ResetPassword';

import { MainBodyText } from '@/client/components/MainBodyText';
import { buildUrl } from '@/shared/lib/routeUtils';

export const SetPasswordResendPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const {
    pageData: { email = '' } = {},
    queryParams,
    recaptchaConfig,
  } = clientState;

  const { recaptchaSiteKey } = recaptchaConfig;

  return (
    <ResetPassword
      email={email}
      headerText="Link expired"
      buttonText="Send me a link"
      formActionOverride={buildUrl('/set-password/resend')}
      queryString={queryParams}
      emailInputLabel="Email address"
      showRecentEmailSummary
      recaptchaSiteKey={recaptchaSiteKey}
    >
      <MainBodyText>This link has expired.</MainBodyText>
      <MainBodyText>
        To receive a new link, please enter your email address below.
      </MainBodyText>
    </ResetPassword>
  );
};
