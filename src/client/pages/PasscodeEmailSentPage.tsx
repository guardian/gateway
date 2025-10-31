import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { PasscodeEmailSent } from '@/client/pages/PasscodeEmailSent';
import { buildQueryParamsString } from '@/shared/lib/queryParams';
import { buildUrl } from '@/shared/lib/routeUtils';

export const PasscodeEmailSentPage = () => {
	const clientState = useClientState();
	const {
		pageData = {},
		queryParams,
		globalMessage = {},
		recaptchaConfig,
		shortRequestId,
	} = clientState;
	const { email, fieldErrors, token, passcodeSendAgainTimer } = pageData;
	const { emailSentSuccess } = queryParams;
	const { error } = globalMessage;
	const { recaptchaSiteKey } = recaptchaConfig;

	const queryString = buildQueryParamsString(queryParams, {
		emailSentSuccess: true,
	});

	return (
		<PasscodeEmailSent
			email={email}
			queryString={queryString}
			changeEmailPage={buildUrl('/signin')}
			passcodeAction={buildUrl('/passcode')}
			showSuccess={emailSentSuccess}
			errorMessage={error}
			recaptchaSiteKey={recaptchaSiteKey}
			formTrackingName="register-or-signin-resend"
			fieldErrors={fieldErrors}
			passcode={token}
			shortRequestId={shortRequestId}
			expiredPage={buildUrl('/signin/code/expired')}
			textType="verification"
			sendAgainTimerInSeconds={passcodeSendAgainTimer}
			showSignInWithPasswordOption
		/>
	);
};
