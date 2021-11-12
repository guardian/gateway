import React, { useContext } from 'react';
import { ClientStateContext } from '@/client/components/ClientState';
import { ClientState } from '@/shared/model/ClientState';
import { ConsentsNewsletters } from '@/client/pages/ConsentsNewsletters';

export const ConsentsNewslettersPage = () => {
  const clientState = useContext<ClientState>(ClientStateContext);
  const newsletters = clientState?.pageData?.newsletters ?? [];

  return <ConsentsNewsletters newsletters={newsletters} />;
};
