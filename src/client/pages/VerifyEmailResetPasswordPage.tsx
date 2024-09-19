import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { ResetPassword } from '@/client/pages/ResetPassword';
import { MainBodyText } from '@/client/components/MainBodyText';

export const VerifyEmailResetPasswordPage = () => {
	const clientState = useClientState();
	const {
		pageData: { email = '', formError } = {},
		queryParams,
		recaptchaConfig,
		shortRequestId,
	} = clientState;
	const { recaptchaSiteKey } = recaptchaConfig;

	return (
		<ResetPassword
			formError={formError}
			email={email}
			headerText="Verify your email"
			buttonText="Request password reset"
			queryString={queryParams}
			recaptchaSiteKey={recaptchaSiteKey}
			formPageTrackingName="forgot-password"
			showHelpCentreMessage
			shortRequestId={shortRequestId}
		>
			<MainBodyText>
				As a security measure, to verify your email, you will need to reset your
				password.
			</MainBodyText>
		</ResetPassword>
	);
};
