import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { ConsentsConfirmation } from '@/client/pages/ConsentsConfirmation';
import { Consents } from '@/shared/model/Consent';

export const ConsentsConfirmationPage = () => {
  const clientState = useClientState();
  const { pageData = {}, globalMessage: { error, success } = {} } = clientState;

  const {
    consents = [],
    newsletters = [],
    returnUrl = 'https://www.theguardian.com',
  } = pageData;

  // Note: profiling_optout is modelled as profiling_optin for Gateway
  const optedIntoProfiling = !!consents.find(
    (consent) => consent.id === Consents.PROFILING && consent.consented,
  );

  const optedIntoPersonalisedAdvertising = !!consents.find(
    (consent) => consent.id === Consents.ADVERTISING && consent.consented,
  );

  const productConsents = consents.filter(
    (c) =>
      !c.id.includes('_optin') &&
      !c.id.includes(Consents.ADVERTISING) &&
      c.consented,
  );

  const subscribedNewsletters = newsletters.filter((n) => n.subscribed);

  return (
    <ConsentsConfirmation
      error={error}
      success={success}
      returnUrl={returnUrl}
      optedIntoProfiling={optedIntoProfiling}
      optedIntoPersonalisedAdvertising={optedIntoPersonalisedAdvertising}
      productConsents={productConsents}
      subscribedNewsletters={subscribedNewsletters}
    />
  );
};
