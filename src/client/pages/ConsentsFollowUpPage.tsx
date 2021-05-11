// ABTEST: followupConsent: This page is only used as part of the followupConsent abtest.
import { ClientState } from '@/shared/model/ClientState';
import React, { useContext } from 'react';
import { ClientStateContext } from '@/client/components/ClientState';
import { ConsentsFollowUp } from '@/client/pages/ConsentsFollowUp';

export const ConsentsFollowUpPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { globalMessage: { error, success } = {}, pageData = {} } = clientState;
  const { returnUrl } = pageData;
  const newsletters = clientState?.pageData?.newsletters ?? [];
  const consents = clientState?.pageData?.consents ?? [];
  return (
    <ConsentsFollowUp
      returnUrl={returnUrl}
      newsletters={newsletters}
      consents={consents}
      error={error}
      success={success}
    />
  );
};
