import React from 'react';
import { SignIn } from '@/client/pages/SignIn';
import useClientState from '@/client/lib/hooks/useClientState';
import { useRemoveEncryptedEmailParam } from '@/client/lib/hooks/useRemoveEncryptedEmailParam';
import { useAB } from '@/client/components/ABReact';

interface Props {
	isReauthenticate?: boolean;
	hideSocialButtons?: boolean;
	forcePasswordPage?: boolean;
}

export const SignInPage = ({
	isReauthenticate = false,
	hideSocialButtons = false,
	forcePasswordPage = false,
}: Props) => {
	const ABTestAPI = useAB();
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

	const usePasscodeSignIn: boolean = (() => {
		if (forcePasswordPage) {
			return false;
		}

		if (ABTestAPI.isUserInVariant('PasscodeSignInTest', 'variant')) {
			return true;
		}

		return !!queryParams.usePasscodeSignIn;
	})();

	return (
		<SignIn
			email={email}
			pageError={pageError}
			formError={formError}
			queryParams={queryParams}
			recaptchaSiteKey={recaptchaSiteKey}
			isReauthenticate={isReauthenticate}
			shortRequestId={clientState.shortRequestId}
			usePasscodeSignIn={usePasscodeSignIn}
			hideSocialButtons={hideSocialButtons}
		/>
	);
};
