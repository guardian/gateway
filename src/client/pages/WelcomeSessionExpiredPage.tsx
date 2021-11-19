import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { ResetPassword } from '@/client/pages/ResetPassword';
import { Routes } from '@/shared/model/Routes';
import { MainBodyText } from '../components/MainBodyText';
import { buildQueryParamsString } from '@/shared/lib/queryParams';
import { buildUrl } from '@/shared/lib/routeUtils';

export const WelcomeSessionExpiredPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData: { email = '' } = {}, queryParams } = clientState;

  const queryString = buildQueryParamsString(queryParams);

  return (
    <ResetPassword
      email={email}
      headerText="Session timed out"
      buttonText="Send me a link"
      formActionOverride={buildUrl(`${Routes.WELCOME}${Routes.RESEND}`)}
      queryString={queryString}
      emailInputLabel="Email address"
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
