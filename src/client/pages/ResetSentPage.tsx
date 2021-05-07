import React, { useContext } from 'react';
import { getProviderById } from '@/shared/lib/emailProvider';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { ResetSent } from '@/client/pages/ResetSent';

export const ResetSentPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData: { emailProvider: emailProviderId } = {} } = clientState;
  const emailProvider = getProviderById(emailProviderId);

  return (
    <ResetSent
      inboxLink={emailProvider?.inboxLink}
      inboxName={emailProvider?.name}
    />
  );
};
