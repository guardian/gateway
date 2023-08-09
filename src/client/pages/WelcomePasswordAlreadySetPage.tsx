import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { Welcome } from '@/client/pages/Welcome';
import { useAB } from '@guardian/ab-react';
import { abSimplifyRegistrationFlowTest } from '@/shared/model/experiments/tests/abSimplifyRegistrationFlowTest';

export const WelcomePasswordAlreadySetPage = () => {
	const clientState = useClientState();
	const { pageData: { email, fieldErrors = [] } = {}, queryParams } =
		clientState;
	const ABTestAPI = useAB();
	const isInAbSimplifyRegFlowTest = ABTestAPI.isUserInVariant(
		abSimplifyRegistrationFlowTest.id,
		abSimplifyRegistrationFlowTest.variants[0].id,
	);
	return (
		<Welcome
			submitUrl={''}
			email={email}
			fieldErrors={fieldErrors}
			passwordSet={true}
			queryParams={queryParams}
			isInAbSimplifyRegFlowTest={isInAbSimplifyRegFlowTest}
		/>
	);
};
