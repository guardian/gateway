import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { ConsentsNewsletters } from '@/client/pages/ConsentsNewsletters';
import { ConsentsNewslettersAB } from '@/client/pages/ConsentsNewslettersAB';
import { useAB } from '@guardian/ab-react';
import { abDefaultWeeklyNewsletterTest } from '@/shared/model/experiments/tests/abDefaultWeeklyNewsletterTest';

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

  // @AB_TEST: Default Weekly Newsletter Test: START
  const ABTestAPI = useAB();
  const isInABTest = ABTestAPI.runnableTest(abDefaultWeeklyNewsletterTest);

  switch (isInABTest?.variantToRun.id) {
    case 'control-off':
      return (
        <ConsentsNewslettersAB
          consents={consents}
          defaultOnboardingEmailConsentState={false}
        />
      );
    case 'variant-on':
      return (
        <ConsentsNewslettersAB
          consents={consents}
          defaultOnboardingEmailConsentState={true}
        />
      );
  }
  // @AB_TEST: Default Weekly Newsletter Test: END

  return <ConsentsNewsletters consents={consents} />;
};
