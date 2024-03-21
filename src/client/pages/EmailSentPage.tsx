import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { EmailSent } from '@/client/pages/EmailSent';
import { buildQueryParamsString } from '@/shared/lib/queryParams';

interface Props {
	pageHeader?: string;
	noAccountInfo?: boolean;
	formTrackingName?: string;
}

export const EmailSentPage = ({
	noAccountInfo,
	formTrackingName,
	pageHeader,
}: Props) => {
	const clientState = useClientState();
	const {
		pageData = {},
		queryParams,
		globalMessage = {},
		recaptchaConfig,
	} = clientState;
	const { email, resendEmailAction, changeEmailPage, formError } = pageData;
	const { error } = globalMessage;
	const { recaptchaSiteKey } = recaptchaConfig;

	const queryString = buildQueryParamsString(queryParams);

	return (
		<EmailSent
			pageHeader={pageHeader}
			formError={formError}
			email={email}
			changeEmailPage={changeEmailPage}
			resendEmailAction={resendEmailAction}
			queryString={queryString}
			errorMessage={error}
			noAccountInfo={noAccountInfo}
			recaptchaSiteKey={recaptchaSiteKey}
			formTrackingName={formTrackingName}
		/>
	);
};
