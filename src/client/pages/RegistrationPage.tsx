import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { Registration } from '@/client/pages/Registration';

export const RegistrationPage = () => {
	const clientState = useClientState();
	const {
		pageData = {},
		recaptchaConfig,
		queryParams,
		shortRequestId,
	} = clientState;
	const { email, formError } = pageData;
	const { recaptchaSiteKey } = recaptchaConfig;

	return (
		<Registration
			formError={formError}
			email={email}
			recaptchaSiteKey={recaptchaSiteKey}
			queryParams={queryParams}
			shortRequestId={shortRequestId}
		/>
	);
};
