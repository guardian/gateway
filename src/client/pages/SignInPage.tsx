import React from 'react';
import { SignIn } from '@/client/pages/SignIn';
import useClientState from '@/client/lib/hooks/useClientState';
import { useRemoveEncryptedEmailParam } from '@/client/lib/hooks/useRemoveEncryptedEmailParam';

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
	const clientState = useClientState();
	const {
		pageData = {},
		globalMessage = {},
		queryParams,
		recaptchaConfig,
	} = clientState;
	const { email, formError, focusPasswordField } = pageData;
	const { error: pageError } = globalMessage;
	const { recaptchaSiteKey } = recaptchaConfig;

	// we use the encryptedEmail parameter to pre-fill the email field, but then want to remove it from the url
	useRemoveEncryptedEmailParam();

	// determines if the passcode view of the sign in page should be shown
	const usePasscodeSignIn: boolean = (() => {
		// if the forcePasswordPage flag is set, we should always show the password view
		// for example when the user clicks "sign in with a password instead"
		if (forcePasswordPage) {
			return false;
		}

		// if the useOktaClassic flag is set, we should always show the password view
		// to maintain the existing behaviour
		if (queryParams.useOktaClassic) {
			return false;
		}

		// if the user has the usePasswordSignIn flag set, we should always show the password view
		if (queryParams.usePasswordSignIn) {
			return false;
		}

		// show the sign in with passcode view by default
		return true;
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
			focusPasswordField={focusPasswordField}
		/>
	);
};
