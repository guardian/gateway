import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { ConsentsCommunication } from '@/client/pages/ConsentsCommunication';

export const ConsentsCommunicationPage = () => {
  const clientState = useContext<ClientState>(ClientStateContext);

  const { pageData = {} } = clientState;
  const { consents = [] } = pageData;

  return <ConsentsCommunication consents={consents} />;
};
