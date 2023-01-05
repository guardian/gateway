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
  const isInABTestVariant = ABTestAPI.isUserInVariant(
    abDefaultWeeklyNewsletterTest.id,
    abDefaultWeeklyNewsletterTest.variants[0].id,
  );

  const geolocation = pageData?.geolocation;
  const isInRegion = geolocation && ['GB', 'US', 'AU'].includes(geolocation);

  if (isInABTestVariant && isInRegion) {
    return (
      <ConsentsNewslettersAB
        consents={consents}
        defaultOnboardingEmailId={'fixme'}
        defaultOnboardingEmailConsentState={true}
      />
    );
  }
  // @AB_TEST: Default Weekly Newsletter Test: END

  return <ConsentsNewsletters consents={consents} />;
};
