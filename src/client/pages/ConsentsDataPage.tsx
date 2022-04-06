import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { Consents } from '@/shared/model/Consent';
import { ConsentsData } from '@/client/pages/ConsentsData';
import { ConsentsDataAB } from './ConsentsDataAB';
import { useAB } from '@guardian/ab-react';
import { useCmpConsent } from '../lib/hooks/useCmpConsent';
import { useAdFreeCookie } from '../lib/hooks/useAdFreeCookie';

export const ConsentsDataPage = () => {
  const clientState = useClientState();

  const { pageData = {} } = clientState;
  const { consents = [] } = pageData;

  const profiling = consents.find(
    (consent) => consent.id === Consents.PROFILING,
  );
  const advertising = consents.find(
    (consent) => consent.id === Consents.ADVERTISING,
  );

  // @AB_TEST: AdvertisingPermissionRegistrationPrompt: START
  const ABTestAPI = useAB();

  const isUserInVariant = ABTestAPI.isUserInVariant(
    'AdvertisingPermissionRegistrationPrompt',
    'variant-show-ad-permission',
  );

  const hasCmpConsent = useCmpConsent();
  const isDigitalSubscriber = useAdFreeCookie();
  // @AB_TEST: AdvertisingPermissionRegistrationPrompt: END

  return (
    <>
      {/* @AB_TEST: AdvertisingPermissionRegistrationPrompt */}
      {isUserInVariant && hasCmpConsent && !isDigitalSubscriber ? (
        <ConsentsDataAB profiling={profiling} advertising={advertising} />
      ) : (
        <ConsentsData
          consented={profiling?.consented}
          description={profiling?.description}
          name={profiling?.name}
          id={profiling?.id || Consents.PROFILING}
        />
      )}
    </>
  );
};
