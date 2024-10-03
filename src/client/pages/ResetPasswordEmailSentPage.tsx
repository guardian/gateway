import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { EmailSent } from '@/client/pages/EmailSent';
import { PasscodeEmailSent } from '@/client/pages/PasscodeEmailSent';
import { buildQueryParamsString } from '@/shared/lib/queryParams';
import { buildUrl } from '@/shared/lib/routeUtils';
import { PasscodeUsed } from '@/client/pages/PasscodeUsed';

export const ResetPasswordEmailSentPage = () => {
	const clientState = useClientState();
	const {
		pageData = {},
		queryParams,
		globalMessage = {},
		recaptchaConfig,
	} = clientState;
	const { email, hasStateHandle, fieldErrors, token, passcodeUsed } = pageData;
	const { emailSentSuccess } = queryParams;
	const { error } = globalMessage;
	const { recaptchaSiteKey } = recaptchaConfig;

	const queryString = buildQueryParamsString(queryParams, {
		emailSentSuccess: true,
	});

	// show passcode email sent page if we have a state handle
	if (hasStateHandle) {
		if (passcodeUsed) {
			return <PasscodeUsed path="/reset-password" queryParams={queryParams} />;
		}

		return (
			<PasscodeEmailSent
				email={email}
				queryString={queryString}
				changeEmailPage={buildUrl('/reset-password')}
				passcodeAction={buildUrl('/reset-password/code')}
				showSuccess={emailSentSuccess}
				errorMessage={error}
				recaptchaSiteKey={recaptchaSiteKey}
				formTrackingName="forgot-password-resend"
				fieldErrors={fieldErrors}
				passcode={token}
				expiredPage={buildUrl('/reset-password/expired')}
				noAccountInfo
				textType="generic"
			/>
		);
	}

	// otherwise show original email sent page
	return (
		<EmailSent
			email={email}
			queryString={queryString}
			changeEmailPage={buildUrl('/reset-password')}
			resendEmailAction={buildUrl('/reset-password/resend')}
			instructionContext="verify and complete creating your account"
			showSuccess={emailSentSuccess}
			errorMessage={error}
			recaptchaSiteKey={recaptchaSiteKey}
			formTrackingName="forgot-password-resend"
			noAccountInfo
		/>
	);
};
