import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { ResetPassword } from '@/client/pages/ResetPassword';
import { MainBodyText } from '@/client/components/MainBodyText';

export const ResetPasswordSessionExpiredPage = () => {
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
      headerText="Session timed out"
      buttonText="Send me a link"
      queryString={queryParams}
      emailInputLabel="Email address"
      recaptchaSiteKey={recaptchaSiteKey}
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
