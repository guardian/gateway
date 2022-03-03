import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { Consents } from '@/shared/model/Consent';
import { ConsentsData } from '@/client/pages/ConsentsData';

export const ConsentsDataPage = () => {
  const clientState = useClientState();

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
