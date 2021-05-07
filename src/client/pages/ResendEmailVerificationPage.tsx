import React, { useContext } from 'react';
import { ResendEmailVerification } from '@/client/pages/ResendEmailVerification';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { getProviderById } from '@/shared/lib/emailProvider';

export const ResendEmailVerificationPage = () => {
  const {
    globalMessage: { success } = {},
    pageData: { email, signInPageUrl, emailProvider: emailProviderId } = {},
  } = useContext<ClientState>(ClientStateContext);

  const emailProvider = getProviderById(emailProviderId);

  return (
    <ResendEmailVerification
      email={email}
      signInPageUrl={signInPageUrl}
      successText={success}
      inboxLink={emailProvider?.inboxLink}
      inboxName={emailProvider?.name}
    />
  );
};
