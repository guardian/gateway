import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { Consents } from '@/shared/model/Consent';
import { ConsentsData } from '@/client/pages/ConsentsData';

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

  const hasCmpConsent = useCmpConsent();
  const isDigitalSubscriber = useAdFreeCookie();
  const shouldPersonalisedAdvertisingPermissionRender =
    hasCmpConsent && !isDigitalSubscriber;

  return (
    <>
      {shouldPersonalisedAdvertisingPermissionRender ? (
        <ConsentsData profiling={profiling} advertising={advertising} />
      ) : (
        <ConsentsData profiling={profiling} />
      )}
    </>
  );
};
