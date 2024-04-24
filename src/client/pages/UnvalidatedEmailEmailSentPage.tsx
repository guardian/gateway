import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { buildQueryParamsString } from '@/shared/lib/queryParams';
import { buildUrl } from '@/shared/lib/routeUtils';
import { MainBodyText } from '@/client/components/MainBodyText';
import { EmailSent } from '@/client/pages/EmailSent';

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
	} = clientState;
	const { email } = pageData;
	const { emailSentSuccess } = queryParams;
	const { error } = globalMessage;
	const { recaptchaSiteKey } = recaptchaConfig;

	const queryString = buildQueryParamsString(queryParams, {
		emailSentSuccess: true,
	});

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
		>
			<MainBodyText>
				For security reasons we need you to change your password.
			</MainBodyText>
		</EmailSent>
	);
};
