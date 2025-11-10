import React, { useEffect } from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { useRemoveEncryptedEmailParam } from '@/client/lib/hooks/useRemoveEncryptedEmailParam';
import { IframedSignIn } from './IframedSignIn';

interface Props {
	isReauthenticate?: boolean;
	hideSocialButtons?: boolean;
}

export const IframedSignInPage = ({
	isReauthenticate = false,
	hideSocialButtons = true,
}: Props) => {
	const clientState = useClientState();
	const {
		pageData = {},
		globalMessage = {},
		queryParams,
		recaptchaConfig,
	} = clientState;
	const { email, formError } = pageData;
	const { error: pageError } = globalMessage;
	const { recaptchaSiteKey } = recaptchaConfig;

	// we use the encryptedEmail parameter to pre-fill the email field, but then want to remove it from the url
	useRemoveEncryptedEmailParam();

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
		<IframedSignIn
			email={email}
			pageError={pageError}
			formError={formError}
			queryParams={queryParams}
			recaptchaSiteKey={recaptchaSiteKey}
			isReauthenticate={isReauthenticate}
			shortRequestId={clientState.shortRequestId}
			hideSocialButtons={hideSocialButtons}
		/>
	);
};
