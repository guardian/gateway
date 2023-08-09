import React from 'react';
import { SignInSuccess } from '@/client/pages/SignInSuccess';
import useClientState from '@/client/lib/hooks/useClientState';
import { useAB } from '@guardian/ab-react';
import { abSimplifyRegistrationFlowTest } from '@/shared/model/experiments/tests/abSimplifyRegistrationFlowTest';

export const SignInSuccessPage = () => {
	const clientState = useClientState();
	const { pageData = {} } = clientState;
	const { geolocation, consents = [] } = pageData;

	const ABTestAPI = useAB();
	const isInAbSimplifyRegFlowTest = ABTestAPI.isUserInVariant(
		abSimplifyRegistrationFlowTest.id,
		abSimplifyRegistrationFlowTest.variants[0].id,
	);
	return (
		<SignInSuccess
			geolocation={geolocation}
			consents={consents}
			isInAbSimplifyRegFlowTest={isInAbSimplifyRegFlowTest}
		/>
	);
};
