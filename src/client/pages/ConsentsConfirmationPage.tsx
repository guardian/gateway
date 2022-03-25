import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { ConsentsConfirmation } from '@/client/pages/ConsentsConfirmation';
import { Consents } from '@/shared/model/Consent';
import { useAB } from '@guardian/ab-react';

export const ConsentsConfirmationPage = () => {
  const clientState = useClientState();
  const { pageData = {}, globalMessage: { error, success } = {} } = clientState;

  const {
    consents = [],
    newsletters = [],
    returnUrl = 'https://www.theguardian.com',
  } = pageData;

  // @AB_TEST: AdvertisingPermissionRegistrationPrompt: START
  const ABTestAPI = useAB();
  // TODO cmp Cookie Consent

  const isUserInVariant = ABTestAPI.isUserInVariant(
    'AdvertisingPermissionRegistrationPrompt',
    'variant-show-ad-permission',
  );
  // @AB_TEST: AdvertisingPermissionRegistrationPrompt: END

  const optedIntoProfiling = !!consents.find(
    // If consent option present and consented === true, this means the user has expressed a
    // preference to NOT be contacted - eg. They opted OUT
    (consent) => consent.id === Consents.PROFILING && consent.consented,
  );

  const optedIntoPersonalisedAdvertising = !!consents.find(
    // If consent option present and consented === true, this means the user has expressed a
    // preference to NOT be contacted - eg. They opted OUT
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
      isUserInVariant={isUserInVariant}
      productConsents={productConsents}
      subscribedNewsletters={subscribedNewsletters}
    />
  );
};
