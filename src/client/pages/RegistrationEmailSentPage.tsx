import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { EmailSent } from '@/client/pages/EmailSent';
import { PasscodeEmailSent } from '@/client/pages/PasscodeEmailSent';
import { buildQueryParamsString } from '@/shared/lib/queryParams';
import { buildUrl } from '@/shared/lib/routeUtils';
import { PasscodeUsed } from '@/client/pages/PasscodeUsed';

export const RegistrationEmailSentPage = () => {
	const clientState = useClientState();
	const {
		pageData = {},
		queryParams,
		globalMessage = {},
		recaptchaConfig,
		shortRequestId,
	} = clientState;
	const {
		email,
		hasStateHandle,
		fieldErrors,
		token,
		passcodeUsed,
		passcodeSendAgainTimer,
	} = pageData;
	const { emailSentSuccess } = queryParams;
	const { error } = globalMessage;
	const { recaptchaSiteKey } = recaptchaConfig;

	const queryString = buildQueryParamsString(queryParams, {
		emailSentSuccess: true,
	});

	// show passcode email sent page if we have a state handle
	if (hasStateHandle) {
		if (passcodeUsed) {
			return (
				<PasscodeUsed
					path="/welcome"
					queryParams={queryParams}
					shortRequestId={shortRequestId}
				/>
			);
		}

		return (
			<PasscodeEmailSent
				email={email}
				queryString={queryString}
				changeEmailPage={buildUrl('/register/email')}
				passcodeAction={buildUrl('/register/code')}
				showSuccess={emailSentSuccess}
				errorMessage={error}
				recaptchaSiteKey={recaptchaSiteKey}
				formTrackingName="register-resend"
				fieldErrors={fieldErrors}
				passcode={token}
				shortRequestId={shortRequestId}
				expiredPage={buildUrl('/welcome/expired')}
				textType="verification"
				sendAgainTimerInSeconds={passcodeSendAgainTimer}
			/>
		);
	}

	// otherwise show original email sent page
	return (
		<EmailSent
			email={email}
			queryString={queryString}
			changeEmailPage={buildUrl('/register/email')}
			resendEmailAction={buildUrl('/register/email-sent/resend')}
			instructionContext="verify and complete creating your account"
			showSuccess={emailSentSuccess}
			errorMessage={error}
			recaptchaSiteKey={recaptchaSiteKey}
			formTrackingName="register-resend"
			shortRequestId={shortRequestId}
		/>
	);
};
