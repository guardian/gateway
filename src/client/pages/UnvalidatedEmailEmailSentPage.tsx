import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { buildQueryParamsString } from '@/shared/lib/queryParams';
import { buildUrl } from '@/shared/lib/routeUtils';
import { MainBodyText } from '@/client/components/MainBodyText';
import { EmailSent } from '@/client/pages/EmailSent';
import { PasscodeUsed } from '@/client/pages/PasscodeUsed';
import { PasscodeEmailSent } from '@/client/pages/PasscodeEmailSent';

interface Props {
	formTrackingName?: string;
}

export const UnvalidatedEmailEmailSentPage = ({ formTrackingName }: Props) => {
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
			return <PasscodeUsed path="/reset-password" queryParams={queryParams} />;
		}

		return (
			<PasscodeEmailSent
				email={email}
				queryString={queryString}
				changeEmailPage={buildUrl('/signin')}
				passcodeAction={buildUrl('/reset-password/code')}
				showSuccess={emailSentSuccess}
				errorMessage={error}
				recaptchaSiteKey={recaptchaSiteKey}
				formTrackingName="forgot-password-resend"
				fieldErrors={fieldErrors}
				passcode={token}
				expiredPage={buildUrl('/reset-password/expired')}
				noAccountInfo
				textType="security"
				shortRequestId={shortRequestId}
				sendAgainTimerInSeconds={passcodeSendAgainTimer}
			/>
		);
	}

	return (
		<EmailSent
			email={email}
			changeEmailPage={buildUrl('/signin')}
			resendEmailAction={buildUrl('/signin/email-sent/resend')}
			queryString={queryString}
			showSuccess={emailSentSuccess}
			errorMessage={error}
			recaptchaSiteKey={recaptchaSiteKey}
			formTrackingName={formTrackingName}
			shortRequestId={shortRequestId}
		>
			<MainBodyText>
				For security reasons we need you to change your password.
			</MainBodyText>
		</EmailSent>
	);
};
