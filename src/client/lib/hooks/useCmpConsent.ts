import { useState, useEffect } from 'react';
import { ConsentState } from '@guardian/consent-management-platform/dist/types';
import { onConsentChange } from '@guardian/consent-management-platform';

/**
 * ConsentState.canTarget checks if user has consented to all consents
 * https://github.com/guardian/consent-management-platform#consentstatecantarget
 */
const hasRequiredCmpConsents = (): Promise<boolean> => {
  return new Promise((resolve) => {
    onConsentChange((state: ConsentState) => {
      return resolve(state.canTarget);
    });
  });
};

// Returns true or false if a user has consented to all CMP consents for their region
export const useCmpConsent: () => boolean = () => {
  const [hasCmpConsent, setCmpConsent] = useState(false);
  useEffect(() => {
    const checkCmpConsent = async () => {
      setCmpConsent(await hasRequiredCmpConsents());
    };
    checkCmpConsent();
  }, []);

  return hasCmpConsent;
};
