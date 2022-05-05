import { useState, useEffect } from 'react';
import { ConsentState } from '@guardian/consent-management-platform/dist/types';
import { onConsent } from '@guardian/consent-management-platform';

/**
 * More info on CMP:
 * https://github.com/guardian/consent-management-platform
 */
export const useCmpConsent: () => boolean = () => {
  const [hasCmpConsent, setCmpConsent] = useState(false);
  useEffect(() => {
    const checkCmpConsent = async () => {
      const consentState: ConsentState = await onConsent();
      setCmpConsent(consentState.canTarget); // canTarget if user has consented to all consents
    };
    checkCmpConsent();
  }, []);

  return hasCmpConsent;
};
