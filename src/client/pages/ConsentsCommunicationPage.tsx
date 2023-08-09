import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { ConsentsCommunication } from '@/client/pages/ConsentsCommunication';
import { useAB } from '@guardian/ab-react';
import { abSimplifyRegistrationFlowTest } from '@/shared/model/experiments/tests/abSimplifyRegistrationFlowTest';

export const ConsentsCommunicationPage = () => {
	const clientState = useClientState();

	const { pageData = {} } = clientState;
	const { consents = [] } = pageData;
	const ABTestAPI = useAB();
	const isInAbSimplifyRegFlowTest = ABTestAPI.isUserInVariant(
		abSimplifyRegistrationFlowTest.id,
		abSimplifyRegistrationFlowTest.variants[0].id,
	);

	return (
		<ConsentsCommunication
			consents={consents}
			isInAbSimplifyRegFlowTest={isInAbSimplifyRegFlowTest}
		/>
	);
};
