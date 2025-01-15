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

	// determines if the passcode view of the sign in page should be shown
	const usePasscodeSignIn: boolean = (() => {
		// if the forcePasswordPage flag is set, we should always show the password view
		// for example when the user clicks "sign in with password instead"
		if (forcePasswordPage) {
			return false;
		}

		// if the useOktaClassic flag is set, we should always show the password view
		// to maintain the existing behaviour
		if (queryParams.useOktaClassic) {
			return false;
		}

		// if the user is in the PasscodeSignInTest variant, we should show the passcode view
		// to test the new sign in flow
		// eventually this will be removed and the passcode view will be shown by default
		if (ABTestAPI.isUserInVariant('PasscodeSignInTest', 'variant')) {
			return true;
		}

		// if the usePasscodeSignIn query param is set, we should show the passcode view
		// this is used for testing the new sign in flow
		// eventually this will be removed and the passcode view will be shown by default
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
