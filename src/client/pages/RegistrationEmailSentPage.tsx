import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { EmailSent } from '@/client/pages/EmailSent';
import { PasscodeEmailSent } from '@/client/pages/PasscodeEmailSent';
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

	// show passcode email sent page if we have a state handle
	if (hasStateHandle) {
		return (
			<PasscodeEmailSent
				email={email}
				queryString={queryString}
				changeEmailPage={buildUrlWithQueryParams(
					'/register/email',
					{},
					queryParams,
				)}
				passcodeAction={buildUrl('/register/code')}
				showSuccess={emailSentSuccess}
				errorMessage={error}
				recaptchaSiteKey={recaptchaSiteKey}
				formTrackingName="register-resend"
				fieldErrors={fieldErrors}
				passcode={token}
			/>
		);
	}

	// otherwise show original email sent page
	return (
		<EmailSent
			email={email}
			queryString={queryString}
			changeEmailPage={buildUrlWithQueryParams(
				'/register/email',
				{},
				queryParams,
			)}
			resendEmailAction={buildUrl('/register/email-sent/resend')}
			instructionContext="verify and complete creating your account"
			showSuccess={emailSentSuccess}
			errorMessage={error}
			recaptchaSiteKey={recaptchaSiteKey}
			formTrackingName="register-resend"
		/>
	);
};
