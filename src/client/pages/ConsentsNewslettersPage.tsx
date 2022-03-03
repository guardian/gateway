import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { ConsentsNewsletters } from '@/client/pages/ConsentsNewsletters';

export const ConsentsNewslettersPage = () => {
  const clientState = useClientState();
  const newsletters = clientState?.pageData?.newsletters ?? [];

  return <ConsentsNewsletters newsletters={newsletters} />;
};
