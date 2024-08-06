import { Divider } from '@guardian/source-development-kitchen/react-components';
import React from 'react';
import { EmailInput } from '@/client/components/EmailInput';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MainForm } from '@/client/components/MainForm';
import { RegistrationConsents } from '@/client/components/RegistrationConsents';
import ThemedLink from '@/client/components/ThemedLink';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { registrationFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import type { RegistrationProps } from '@/client/pages/Registration';
import { divider } from '@/client/styles/Shared';
import type { AppName } from '@/shared/lib/appNameUtils';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import type { GeoLocation } from '@/shared/model/Geolocation';
import { newsletterAdditionalTerms } from '@/shared/model/Newsletter';

type RegisterWithEmailProps = RegistrationProps & {
	geolocation?: GeoLocation;
	appName?: AppName;
};

export const RegisterWithEmail = ({
	email,
	recaptchaSiteKey,
	queryParams,
	formError,
	geolocation,
	appName,
}: RegisterWithEmailProps) => {
	const formTrackingName = 'register';

	usePageLoadOphanInteraction(formTrackingName);

	const isJobs = queryParams.clientId === 'jobs';

	return (
		<MinimalLayout pageHeader="Create your account">
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
				additionalTerms={newsletterAdditionalTerms}
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
