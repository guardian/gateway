import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { ResetPassword } from '@/client/pages/ResetPassword';
import { MainBodyText } from '@/client/components/MainBodyText';

export const ResetPasswordPage = () => {
	const clientState = useClientState();
	const {
		pageData: { email = '', formError } = {},
		queryParams,
		recaptchaConfig,
		shortRequestId,
		globalMessage = {},
	} = clientState;
	const { recaptchaSiteKey } = recaptchaConfig;
	const { error: pageError } = globalMessage;

	return (
		<ResetPassword
			formError={formError}
			email={email}
			headerText="Reset password"
			buttonText="Request password reset"
			queryString={queryParams}
			recaptchaSiteKey={recaptchaSiteKey}
			formPageTrackingName="forgot-password"
			showHelpCentreMessage
			shortRequestId={shortRequestId}
			pageError={pageError}
		>
			<MainBodyText>
				Enter your email address and we’ll send you instructions to reset your
				password.
			</MainBodyText>
		</ResetPassword>
	);
};
