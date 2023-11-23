import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { RegisterWithEmail } from './RegisterWithEmail';

export const RegisterWithEmailPage = () => {
	const clientState = useClientState();
	const { pageData = {}, recaptchaConfig, queryParams } = clientState;
	const { email, formError, isNativeApp } = pageData;
	const { recaptchaSiteKey } = recaptchaConfig;

	return (
		<RegisterWithEmail
			formError={formError}
			email={email}
			recaptchaSiteKey={recaptchaSiteKey}
			queryParams={queryParams}
			isNativeApp={isNativeApp}
		/>
	);
};
