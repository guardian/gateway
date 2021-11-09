import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { ResetPassword } from '@/client/pages/ResetPassword';
import { Routes } from '@/shared/model/Routes';
import { useLocation } from 'react-router-dom';
import { PageBodyText } from '../components/PageBodyText';

export const WelcomeSessionExpiredPage = () => {
  const { search } = useLocation();
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData: { email = '' } = {} } = clientState;

  return (
    <ResetPassword
      email={email}
      headerText="Session timed out"
      buttonText="Send me a link"
      formActionOverride={`${Routes.WELCOME}${Routes.RESEND}`}
      queryString={search}
    >
      <PageBodyText>
        The link we sent you was valid for 30 minutes and has now expired.
      </PageBodyText>
      <PageBodyText>
        Please enter your email address below and we will send you another link.
      </PageBodyText>
    </ResetPassword>
  );
};
