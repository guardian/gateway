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

  const optedIntoProfiling = !!consents.find(
    // If consent option present and consented === true, this means the user has expressed a
    // preference to NOT be contacted - eg. They opted OUT
    (consent) => consent.id === Consents.PROFILING && consent.consented,
  );

  const productConsents = consents.filter(
    (c) => !c.id.includes('_optin') && c.consented,
  );

  const subscribedNewsletters = newsletters.filter((n) => n.subscribed);

  return (
    <ConsentsConfirmation
      error={error}
      success={success}
      returnUrl={returnUrl}
      optedIntoProfiling={optedIntoProfiling}
      productConsents={productConsents}
      subscribedNewsletters={subscribedNewsletters}
    />
  );
};
