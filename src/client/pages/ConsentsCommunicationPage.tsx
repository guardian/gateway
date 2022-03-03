import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { ConsentsCommunication } from '@/client/pages/ConsentsCommunication';

export const ConsentsCommunicationPage = () => {
  const clientState = useClientState();

  const { pageData = {} } = clientState;
  const { consents = [] } = pageData;

  return <ConsentsCommunication consents={consents} />;
};
