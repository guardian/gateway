import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { ResetPassword } from '@/client/pages/ResetPassword';
import { Routes } from '@/shared/model/Routes';
import { MainBodyText } from '@/client/components/MainBodyText';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';

export const WelcomeResendPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData: { email = '' } = {}, queryParams } = clientState;

  const queryString = addQueryParamsToPath('', queryParams);

  return (
    <ResetPassword
      email={email}
      headerText="Link expired"
      buttonText="Send me a link"
      formActionOverride={`${Routes.WELCOME}${Routes.RESEND}`}
      queryString={queryString}
      inputLabel="Email address"
      showRecentEmailSummary
    >
      <MainBodyText>This link has expired.</MainBodyText>
      <MainBodyText>
        To receive a new link, please enter your email address below.
      </MainBodyText>
    </ResetPassword>
  );
};
