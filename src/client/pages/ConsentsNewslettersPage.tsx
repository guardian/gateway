import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { ConsentsNewsletters } from '@/client/pages/ConsentsNewsletters';

export const ConsentsNewslettersPage = () => {
  const clientState = useClientState();
  const pageData = clientState?.pageData;
  const consents = [
    ...(pageData?.newsletters ?? []).map((newsletter) => ({
      type: 'newsletter' as const,
      consent: newsletter,
    })),
    ...(pageData?.consents ?? []).map((consent) => ({
      type: 'consent' as const,
      consent,
    })),
  ];

  return <ConsentsNewsletters consents={consents} />;
};
