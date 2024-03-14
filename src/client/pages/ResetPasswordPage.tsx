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
	} = clientState;
	const { recaptchaSiteKey } = recaptchaConfig;

	return (
		<ResetPassword
			formError={formError}
			email={email}
			headerText="Reset password"
			buttonText="Request password reset"
			queryString={queryParams}
			recaptchaSiteKey={recaptchaSiteKey}
			formPageTrackingName="forgot-password"
		>
			<MainBodyText>
				Enter your email address and we’ll send you instructions to reset your
				password.
			</MainBodyText>
		</ResetPassword>
	);
};
