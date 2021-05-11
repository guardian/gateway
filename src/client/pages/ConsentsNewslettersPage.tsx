import React, { useContext } from 'react';
import { ClientStateContext } from '@/client/components/ClientState';
import { ClientState } from '@/shared/model/ClientState';
import { useAB } from '@guardian/ab-react';
import { ConsentsNewsletters } from '@/client/pages/ConsentsNewsletters';

export const ConsentsNewslettersPage = () => {
  const clientState = useContext<ClientState>(ClientStateContext);
  const newsletters = clientState?.pageData?.newsletters ?? [];

  // @AB_TEST: Single Newsletter Test: START
  const ABTestAPI = useAB();
  const isUserInTest = ABTestAPI.isUserInVariant(
    'SingleNewsletterTest',
    'variant',
  );
  // @AB_TEST: Single Newsletter Test: END

  return (
    <ConsentsNewsletters
      newsletters={newsletters}
      isUserInTest={isUserInTest}
    />
  );
};
