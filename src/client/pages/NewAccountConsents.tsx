import React, { useRef } from 'react';
import { MainForm } from '@/client/components/MainForm';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { RegistrationProps } from '@/client/pages/Registration';
import { GeoLocation } from '@/shared/model/Geolocation';
import { registrationFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import { RegistrationConsents } from '@/client/components/RegistrationConsents';
import { AppName } from '@/shared/lib/appNameUtils';
import { newsletterAdditionalTerms } from '@/shared/model/Newsletter';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { MainBodyText } from '@/client/components/MainBodyText';
import ThemedLink from '@/client/components/ThemedLink';
import locations from '@/shared/lib/locations';
import { SUPPORT_EMAIL } from '@/shared/model/Configuration';
import { PasscodeErrors } from '@/shared/model/Errors';

type NewAccountConsentsProps = RegistrationProps & {
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

export const NewAccountConsents = ({
	email,
	recaptchaSiteKey,
	queryParams,
	formError,
	geolocation,
	appName,
	shortRequestId,
	pageError,
}: NewAccountConsentsProps) => {
	const formTrackingName = 'register';

	const formRef = useRef(null);

	usePageLoadOphanInteraction(formTrackingName);

	const isJobs = queryParams.clientId === 'jobs';

	return (
		<MinimalLayout
			pageHeader="Complete your account"
			shortRequestId={shortRequestId}
			errorContext={getErrorContext(pageError)}
			errorOverride={pageError}
		>
			<MainBodyText>
				<strong>{email}</strong>
			</MainBodyText>
			<MainForm
				formRef={formRef}
				formAction={buildUrlWithQueryParams(
					'/welcome/complete-account',
					{},
					queryParams,
				)}
				submitButtonText="Next"
				recaptchaSiteKey={recaptchaSiteKey}
				formTrackingName={formTrackingName}
				disableOnSubmit
				formErrorMessageFromParent={formError}
				onSubmit={(e) => {
					registrationFormSubmitOphanTracking(e.target as HTMLFormElement);
					return undefined;
				}}
				additionalTerms={[newsletterAdditionalTerms, isJobs === false].filter(
					Boolean,
				)}
				shortRequestId={shortRequestId}
			>
				<RegistrationConsents
					geolocation={geolocation}
					appName={appName}
					isJobs={isJobs}
				/>
			</MainForm>
		</MinimalLayout>
	);
};
