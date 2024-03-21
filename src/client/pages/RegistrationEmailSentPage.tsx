import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { EmailSent } from '@/client/pages/EmailSent';
import { buildQueryParamsString } from '@/shared/lib/queryParams';

import { buildUrl, buildUrlWithQueryParams } from '@/shared/lib/routeUtils';

export const RegistrationEmailSentPage = () => {
	const clientState = useClientState();
	const {
		pageData = {},
		queryParams,
		globalMessage = {},
		recaptchaConfig,
	} = clientState;
	const { email } = pageData;
	const { error } = globalMessage;
	const { recaptchaSiteKey } = recaptchaConfig;

	const queryString = buildQueryParamsString(queryParams);

	return (
		<EmailSent
			pageHeader="Check your inbox to verify your email"
			email={email}
			queryString={queryString}
			changeEmailPage={buildUrlWithQueryParams('/register', {}, queryParams)}
			resendEmailAction={buildUrl('/register/email-sent/resend')}
			instructionContext="verify and complete creating your account"
			errorMessage={error}
			recaptchaSiteKey={recaptchaSiteKey}
			formTrackingName="register-resend"
		/>
	);
};
