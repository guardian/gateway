import { useState, useEffect } from 'react';
import { ConsentState } from '@guardian/consent-management-platform/dist/types';
import { onConsentChange } from '@guardian/consent-management-platform';

/**
 * This hook checks the CMP (Consent Management Platform) browser cookies. It returns true only if everything
 * has been consented to. This code is lifted from the Sign In Gate Display Rules in DotCom-Rendering repo:
 * https://github.com/guardian/dotcom-rendering/blob/main/dotcom-rendering/src/web/components/SignInGate/displayRule.ts#L71-L105
 */
const hasRequiredConsents = (): Promise<boolean> => {
  const hasConsentedToAll = (state: ConsentState) => {
    const consentFlags = state.tcfv2?.consents
      ? Object.values(state.tcfv2.consents)
      : [];
    const vendorConsentFlags = state.tcfv2?.vendorConsents
      ? Object.values(state.tcfv2.vendorConsents)
      : [];
    const isEmpty =
      consentFlags.length === 0 || vendorConsentFlags.length === 0;

    return !isEmpty && [...consentFlags, ...vendorConsentFlags].every(Boolean);
  };

  return new Promise((resolve) => {
    onConsentChange((state) => {
      if (state.tcfv2) {
        return resolve(hasConsentedToAll(state));
      }

      if (state.ccpa) {
        return resolve(state.ccpa.doNotSell === false);
      }

      if (state.aus) {
        return resolve(state.aus.personalisedAdvertising);
      }

      // this shouldn't ever be hit, but this is here as safety
      return resolve(false);
    });
  });
};

const hasRequiredCmpConsents: () => Promise<boolean> = async () => {
  return await hasRequiredConsents();
};

// Returns true or false if a user has consented to all CMP consents for their region
export const useCmpConsent: () => boolean = () => {
  const [hasCmpConsent, setCmpConsent] = useState(false);
  useEffect(() => {
    const checkCmpConsent = async () => {
      const consented = await hasRequiredCmpConsents();
      setCmpConsent(consented);
    };
    checkCmpConsent();
  }, []);

  return hasCmpConsent;
};
