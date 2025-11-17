import React, { useEffect } from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { IframedRegisterWithEmail } from '@/client/pages/IframedRegisterWithEmail';

export const IframedRegisterWithEmailPage = () => {
	const clientState = useClientState();
	const {
		pageData = {},
		recaptchaConfig,
		queryParams,
		shortRequestId,
		globalMessage = {},
	} = clientState;
	const { email, formError } = pageData;
	const { recaptchaSiteKey } = recaptchaConfig;
	const { error: pageError } = globalMessage;

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
		<IframedRegisterWithEmail
			formError={formError}
			email={email}
			recaptchaSiteKey={recaptchaSiteKey}
			queryParams={queryParams}
			shortRequestId={shortRequestId}
			pageError={pageError}
		/>
	);
};
