import { useState, useEffect } from 'react';
import { ConsentState, onConsent } from '@guardian/libs';

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
		void checkCmpConsent();
	}, []);

	return hasCmpConsent;
};
