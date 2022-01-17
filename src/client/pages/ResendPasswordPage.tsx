import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { ResetPassword } from '@/client/pages/ResetPassword';
import { MainBodyText } from '@/client/components/MainBodyText';

export const ResendPasswordPage = () => {
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
