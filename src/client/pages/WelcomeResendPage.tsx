import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { ResetPassword } from '@/client/pages/ResetPassword';
import { MainBodyText } from '@/client/components/MainBodyText';
import { buildUrl } from '@/shared/lib/routeUtils';

export const WelcomeResendPage = () => {
	const clientState = useClientState();
	const {
		pageData: { email = '', formError } = {},
		queryParams,
		recaptchaConfig,
	} = clientState;

	const { recaptchaSiteKey } = recaptchaConfig;

	return (
		<ResetPassword
			email={email}
			headerText="Link expired"
			buttonText="Send me a link"
			formActionOverride={buildUrl('/welcome/resend')}
			queryString={queryParams}
			emailInputLabel="Email address"
			showRecentEmailInformationBox
			recaptchaSiteKey={recaptchaSiteKey}
			formPageTrackingName="welcome-link-expired"
			formError={formError}
		>
			<MainBodyText>This link has expired.</MainBodyText>
			<MainBodyText>
				To receive a new link, please enter your email address below.
			</MainBodyText>
		</ResetPassword>
	);
};
