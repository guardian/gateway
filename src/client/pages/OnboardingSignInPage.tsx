import React from 'react';
import useClientState from '@/client/lib/hooks/useClientState';
import { useRemoveEncryptedEmailParam } from '@/client/lib/hooks/useRemoveEncryptedEmailParam';
import { OnboardingSignIn } from './OnboardingSignIn';

interface Props {
	isReauthenticate?: boolean;
	hideSocialButtons?: boolean;
}

export const OnboardingSignInPage = ({
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

	return (
		<OnboardingSignIn
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
