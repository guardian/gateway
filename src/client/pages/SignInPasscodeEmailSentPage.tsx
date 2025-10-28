import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { buildQueryParamsString } from '@/shared/lib/queryParams';
import { buildUrl } from '@/shared/lib/routeUtils';
import { PasscodeEmailSent } from '@/client/pages/PasscodeEmailSent';
import { SignedInAsPage } from './SignedInAsPage';

export const SignInPasscodeEmailSentPage = () => {
	const clientState = useClientState();
	const {
		pageData = {},
		queryParams,
		globalMessage = {},
		recaptchaConfig,
		shortRequestId,
	} = clientState;
	const { email, fieldErrors, token, passcodeUsed, passcodeSendAgainTimer } =
		pageData;
	const { emailSentSuccess } = queryParams;
	const { error } = globalMessage;
	const { recaptchaSiteKey } = recaptchaConfig;

	const queryString = buildQueryParamsString(queryParams, {
		emailSentSuccess: true,
	});

	// if the passcode has already been used, show the signed in as page
	if (passcodeUsed) {
		return <SignedInAsPage />;
	}

	return (
		<PasscodeEmailSent
			email={email}
			queryString={queryString}
			changeEmailPage={buildUrl('/signin')}
			passcodeAction={buildUrl('/signin/code')}
			showSuccess={emailSentSuccess}
			errorMessage={error}
			recaptchaSiteKey={recaptchaSiteKey}
			formTrackingName="signin-passcode-resend"
			fieldErrors={fieldErrors}
			passcode={token}
			expiredPage={buildUrl('/signin/code/expired')}
			noAccountInfo
			textType="signin"
			shortRequestId={shortRequestId}
			showSignInWithPasswordOption
			sendAgainTimerInSeconds={passcodeSendAgainTimer}
		/>
	);
};
