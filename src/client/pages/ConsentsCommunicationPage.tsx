import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { Consents } from '@/shared/model/Consent';
import { ConsentsCommunication } from '@/client/pages/ConsentsCommunication';

export const ConsentsCommunicationPage = () => {
  const clientState = useContext<ClientState>(ClientStateContext);

  const { pageData = {} } = clientState;
  const { consents = [] } = pageData;

  const marketResearchOptout = consents.find(
    (consent) => consent.id === Consents.MARKET_RESEARCH,
  );

  const consentsWithoutOptout = consents.filter(
    (consent) => !consent.id.includes('_optout'),
  );

  return (
    <ConsentsCommunication
      marketResearchOptout={marketResearchOptout}
      consentsWithoutOptout={consentsWithoutOptout}
    />
  );
};
