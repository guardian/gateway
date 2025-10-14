import React from 'react';
import { MainForm } from '@/client/components/MainForm';
import { EmailInput } from '@/client/components/EmailInput';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { RegistrationProps } from '@/client/pages/Registration';
import { GeoLocation } from '@/shared/model/Geolocation';
import { registrationFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import {
	changeSettingsTerms,
	RegistrationConsents,
} from '@/client/components/RegistrationConsents';
import { AppName } from '@/shared/lib/appNameUtils';
import { newsletterAdditionalTerms } from '@/shared/model/Newsletter';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { Divider } from '@guardian/source-development-kitchen/react-components';
import { divider } from '@/client/styles/Shared';
import { MainBodyText } from '@/client/components/MainBodyText';
import ThemedLink from '@/client/components/ThemedLink';
import locations from '@/shared/lib/locations';
import { SUPPORT_EMAIL } from '@/shared/model/Configuration';
import { PasscodeErrors } from '@/shared/model/Errors';

type RegisterWithEmailProps = RegistrationProps & {
	geolocation?: GeoLocation;
	appName?: AppName;
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

export const RegisterWithEmail = ({
	email,
	recaptchaSiteKey,
	queryParams,
	formError,
	geolocation,
	appName,
	shortRequestId,
	pageError,
}: RegisterWithEmailProps) => {
	const formTrackingName = 'register';

	usePageLoadOphanInteraction(formTrackingName);

	const isJobs = queryParams.clientId === 'jobs';

	return (
		<MinimalLayout
			pageHeader="Create your account"
			shortRequestId={shortRequestId}
			errorContext={getErrorContext(pageError)}
			errorOverride={pageError}
		>
			<MainForm
				formAction={buildUrlWithQueryParams('/register', {}, queryParams)}
				submitButtonText="Next"
				recaptchaSiteKey={recaptchaSiteKey}
				formTrackingName={formTrackingName}
				disableOnSubmit
				formErrorMessageFromParent={formError}
				onSubmit={(e) => {
					registrationFormSubmitOphanTracking(e.target as HTMLFormElement);
					return undefined;
				}}
				additionalTerms={[
					newsletterAdditionalTerms,
					isJobs === false && changeSettingsTerms,
				].filter(Boolean)}
				shortRequestId={shortRequestId}
			>
				<EmailInput defaultValue={email} autoComplete="off" />
				<RegistrationConsents
					geolocation={geolocation}
					appName={appName}
					isJobs={isJobs}
				/>
			</MainForm>
			<Divider spaceAbove="tight" size="full" cssOverrides={divider} />
			<MainBodyText>
				Already have an account?{' '}
				<ThemedLink href={buildUrlWithQueryParams('/signin', {}, queryParams)}>
					Sign in
				</ThemedLink>
			</MainBodyText>
		</MinimalLayout>
	);
};
