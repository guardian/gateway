import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { ConsentsConfirmation } from '@/client/pages/ConsentsConfirmation';
import { Consents } from '@/shared/model/Consent';
import { useAB } from '@guardian/ab-react';

export const ConsentsConfirmationPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData = {}, globalMessage: { error, success } = {} } = clientState;

  const {
    consents = [],
    newsletters = [],
    returnUrl = 'https://www.theguardian.com',
  } = pageData;

  // @AB_TEST: Single Newsletter Test - Remove Market Research: START
  const ABTestAPI = useAB();
  const isUserInTest = ABTestAPI.isUserInVariant(
    'SingleNewsletterTest',
    'variant',
  );
  // @AB_TEST: Single Newsletter Test - Remove Market Research: END

  const optedOutOfProfiling = !!consents.find(
    // If consent option present and consented === true, this means the user has expressed a
    // preference to NOT be contacted - eg. They opted OUT
    (consent) => consent.id === Consents.PROFILING && consent.consented,
  );

  const optedOutOfMarketResearch = !!consents.find(
    (consent) => consent.id === Consents.MARKET_RESEARCH && consent.consented,
  );

  const productConsents = consents.filter(
    (c) => !c.id.includes('_optout') && c.consented,
  );

  const subscribedNewsletters = newsletters.filter((n) => n.subscribed);

  return (
    <ConsentsConfirmation
      error={error}
      success={success}
      returnUrl={returnUrl}
      isUserInTest={isUserInTest}
      optedOutOfProfiling={optedOutOfProfiling}
      optedOutOfMarketResearch={optedOutOfMarketResearch}
      productConsents={productConsents}
      subscribedNewsletters={subscribedNewsletters}
    />
  );
};
