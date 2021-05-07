import React, { useContext } from 'react';
import { ClientStateContext } from '@/client/components/ClientState';
import { ClientState } from '@/shared/model/ClientState';
import { Consents } from '@/shared/model/Consent';
import { ConsentsData } from '@/client/pages/ConsentsData';

export const ConsentsDataPage = () => {
  const clientState = useContext<ClientState>(ClientStateContext);

  const { pageData = {} } = clientState;
  const { consents = [] } = pageData;

  const profiling_optout = consents.find(
    (consent) => consent.id === Consents.PROFILING,
  );

  return (
    <ConsentsData
      consented={profiling_optout?.consented}
      description={profiling_optout?.description}
    />
  );
};
