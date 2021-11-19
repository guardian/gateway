import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { ResetPassword } from '@/client/pages/ResetPassword';
import { MainBodyText } from '@/client/components/MainBodyText';
import { buildQueryParamsString } from '@/shared/lib/queryParams';

export const ResendPasswordPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData: { email = '' } = {}, queryParams } = clientState;

  const queryString = buildQueryParamsString(queryParams);

  return (
    <ResetPassword
      email={email}
      headerText="Link expired"
      buttonText="Send me a link"
      queryString={queryString}
      emailInputLabel="Email address"
      showRecentEmailSummary
    >
      <MainBodyText>This link has expired.</MainBodyText>
      <MainBodyText>
        To receive a new link, please enter your email address below.
      </MainBodyText>
    </ResetPassword>
  );
};
