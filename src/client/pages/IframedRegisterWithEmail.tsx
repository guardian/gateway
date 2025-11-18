import React from 'react';
import { MainForm } from '@/client/components/MainForm';
import { EmailInput } from '@/client/components/EmailInput';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { RegistrationProps } from '@/client/pages/Registration';
import { registrationFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import ThemedLink from '@/client/components/ThemedLink';
import locations from '@/shared/lib/locations';
import { SUPPORT_EMAIL } from '@/shared/model/Configuration';
import { PasscodeErrors } from '@/shared/model/Errors';

type RegisterWithEmailProps = RegistrationProps & {
	shortRequestId?: string;
	pageError?: string;
};

const getErrorContext = (pageError?: string) => {
	if (pageError === PasscodeErrors.PASSCODE_EXPIRED) {
		return (
			<>
				<div>
					Please request a new verification code to create your account.
				</div>
				<br />
				<div>
					If you are still having trouble, please contact our customer service
					team at{' '}
					<ThemedLink href={locations.SUPPORT_EMAIL_MAILTO}>
						{SUPPORT_EMAIL}
					</ThemedLink>
					.
				</div>
			</>
		);
	}
};

export const IframedRegisterWithEmail = ({
	email,
	recaptchaSiteKey,
	queryParams,
	formError,
	shortRequestId,
	pageError,
}: RegisterWithEmailProps) => {
	const formTrackingName = 'register-iframed';

	usePageLoadOphanInteraction(formTrackingName);

	return (
		<MinimalLayout
			pageHeader="Create your account"
			leadText="Unlock your premium experience, online and in the app."
			shortRequestId={shortRequestId}
			errorContext={getErrorContext(pageError)}
			errorOverride={pageError}
			showGuardianHeader={false}
			subduedHeadingStyle={true}
		>
			<MainForm
				formAction={buildUrlWithQueryParams('/register', {}, queryParams)}
				submitButtonText="Create your account"
				recaptchaSiteKey={recaptchaSiteKey}
				formTrackingName={formTrackingName}
				disableOnSubmit
				formErrorMessageFromParent={formError}
				onSubmit={(e) => {
					registrationFormSubmitOphanTracking(e.target as HTMLFormElement);
					return undefined;
				}}
				termsStyle="secondary"
				primaryTermsPosition={false}
				shortRequestId={shortRequestId}
			>
				<EmailInput
					label="Email address"
					defaultValue={email}
					autoComplete="off"
				/>
			</MainForm>
		</MinimalLayout>
	);
};
