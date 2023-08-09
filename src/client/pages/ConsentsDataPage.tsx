import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { Consents } from '@/shared/model/Consent';
import { ConsentsData } from '@/client/pages/ConsentsData';

import { useCmpConsent } from '../lib/hooks/useCmpConsent';
import { useAdFreeCookie } from '../lib/hooks/useAdFreeCookie';

import { useAB } from '@guardian/ab-react';
import { abSimplifyRegistrationFlowTest } from '@/shared/model/experiments/tests/abSimplifyRegistrationFlowTest';

export const ConsentsDataPage = () => {
	const clientState = useClientState();

	const { pageData = {} } = clientState;
	const { consents = [] } = pageData;

	// Note: profiling_optout is modelled as profiling_optin for Gateway
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
	const ABTestAPI = useAB();
	const isInAbSimplifyRegFlowTest = ABTestAPI.isUserInVariant(
		abSimplifyRegistrationFlowTest.id,
		abSimplifyRegistrationFlowTest.variants[0].id,
	);

	return (
		<ConsentsData
			profiling={profiling}
			isInAbSimplifyRegFlowTest={isInAbSimplifyRegFlowTest}
			{...(shouldPersonalisedAdvertisingPermissionRender && { advertising })}
		/>
	);
};
