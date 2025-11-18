import React, { useEffect } from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { IframedPasscodeEmailSent } from '@/client/pages/IframedPasscodeEmailSent';
import { buildQueryParamsString } from '@/shared/lib/queryParams';
import { buildUrl } from '@/shared/lib/routeUtils';

export const IframedPasscodeEmailSentPage = () => {
	const clientState = useClientState();
	const {
		pageData = {},
		queryParams,
		globalMessage = {},
		recaptchaConfig,
		shortRequestId,
	} = clientState;
	const { email, fieldErrors, token, passcodeSendAgainTimer } = pageData;
	const { error } = globalMessage;
	const { recaptchaSiteKey } = recaptchaConfig;

	const queryString = buildQueryParamsString(queryParams, {
		emailSentSuccess: true,
	});

	useEffect(() => {
		const height = document.body.scrollHeight;
		window.parent.postMessage(
			{
				context: 'supporterOnboarding',
				type: 'iframeHeightChange',
				value: height,
			},
			'*',
		);
	}, []);

	return (
		<IframedPasscodeEmailSent
			email={email}
			queryString={queryString}
			passcodeAction={buildUrl('/passcode')}
			errorMessage={error}
			recaptchaSiteKey={recaptchaSiteKey}
			formTrackingName="register-or-signin-resend"
			fieldErrors={fieldErrors}
			passcode={token}
			shortRequestId={shortRequestId}
			expiredPage={buildUrl('/signin/code/expired')}
			sendAgainTimerInSeconds={passcodeSendAgainTimer}
			showSignInWithPasswordOption
		/>
	);
};
