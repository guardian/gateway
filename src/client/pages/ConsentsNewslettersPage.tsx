import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { useCmpConsent } from '@/client/lib/hooks/useCmpConsent';
import { ConsentsNewsletters } from '@/client/pages/ConsentsNewsletters';
import { ConsentsNewslettersAB } from '@/client/pages/ConsentsNewslettersAB';
import { useAB } from '@guardian/ab-react';
import { abDefaultWeeklyNewsletterTest } from '@/shared/model/experiments/tests/abDefaultWeeklyNewsletterTest';
import { Newsletters } from '@/shared/model/Newsletter';

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
  const filteredConsents = consents.filter(
    (consentType) =>
      consentType.consent?.id !== Newsletters.SATURDAY_ROUNDUP_TRIAL,
  );

  const ABTestAPI = useAB();
  const isInABTestVariant = ABTestAPI.isUserInVariant(
    abDefaultWeeklyNewsletterTest.id,
    abDefaultWeeklyNewsletterTest.variants[0].id,
  );

  const geolocation = pageData?.geolocation;
  const isInRegion = geolocation && ['GB', 'US', 'AU'].includes(geolocation);
  const hasCmpConsent = useCmpConsent();

  if (isInABTestVariant && hasCmpConsent && isInRegion) {
    return (
      <ConsentsNewslettersAB
        consents={filteredConsents}
        defaultOnboardingEmailId={Newsletters.SATURDAY_ROUNDUP_TRIAL}
        defaultOnboardingEmailConsentState={true}
      />
    );
  }
  // @AB_TEST: Default Weekly Newsletter Test: END

  return <ConsentsNewsletters consents={filteredConsents} />; // @AB_TEST: filtering out the Default Weekly Newsletter
};
