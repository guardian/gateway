import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { NewAccountConsents } from './NewAccountConsents';

export const NewAccountConsentsPage = () => {
	const clientState = useClientState();
	const {
		pageData = {},
		recaptchaConfig,
		queryParams,
		shortRequestId,
		globalMessage = {},
	} = clientState;
	const { email, formError } = pageData;
	const { recaptchaSiteKey } = recaptchaConfig;
	const { error: pageError } = globalMessage;

	return (
		<NewAccountConsents
			formError={formError}
			email={email}
			recaptchaSiteKey={recaptchaSiteKey}
			queryParams={queryParams}
			geolocation={pageData.geolocation}
			appName={pageData.appName}
			shortRequestId={shortRequestId}
			pageError={pageError}
		/>
	);
};
