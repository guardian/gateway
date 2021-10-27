import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { ResetPassword } from '@/client/pages/ResetPassword';
import { PageBodyText } from '@/client/components/PageBodyText';
import { Routes } from '@/shared/model/Routes';

export const SetPasswordSessionExpiredPage = () => {
  const { search } = useLocation();
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData: { email = '' } = {} } = clientState;

  return (
    <ResetPassword
      email={email}
      headerText="Session timed out"
      buttonText="Send me a link"
      formActionOverride={`${Routes.SET_PASSWORD}${Routes.RESEND}`}
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
