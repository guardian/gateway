import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { ResetPassword } from '@/client/pages/ResetPassword';
import { MainBodyText } from '@/client/components/MainBodyText';
import { buildUrl } from '@/shared/lib/routeUtils';

export const SetPasswordResendPage = () => {
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
			headerText="This link has expired"
			buttonText="Resend link"
			formActionOverride={buildUrl('/set-password/resend')}
			queryString={queryParams}
			emailInputLabel="Email address"
			showRecentEmailInformationBox
			recaptchaSiteKey={recaptchaSiteKey}
			formPageTrackingName="set-password-link-expired"
			formError={formError}
		>
			<MainBodyText>
				To receive a new link, please enter your email address below.
			</MainBodyText>
		</ResetPassword>
	);
};
