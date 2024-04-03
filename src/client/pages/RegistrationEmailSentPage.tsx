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
	const { email, hasStateHandle, fieldErrors, token } = pageData;
	const { emailSentSuccess } = queryParams;
	const { error } = globalMessage;
	const { recaptchaSiteKey } = recaptchaConfig;

	const queryString = buildQueryParamsString(queryParams, {
		emailSentSuccess: true,
	});

	return (
		<EmailSent
			email={email}
			queryString={queryString}
			changeEmailPage={buildUrlWithQueryParams('/register', {}, queryParams)}
			resendEmailAction={buildUrl('/register/email-sent/resend')}
			passcodeAction={buildUrl('/register/code')}
			instructionContext="verify and complete creating your account"
			showSuccess={emailSentSuccess}
			errorMessage={error}
			recaptchaSiteKey={recaptchaSiteKey}
			formTrackingName="register-resend"
			hasStateHandle={hasStateHandle}
			fieldErrors={fieldErrors}
			passcode={token}
		/>
	);
};
