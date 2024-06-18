import React from 'react';
import { MainForm } from '@/client/components/MainForm';
import { EmailInput } from '@/client/components/EmailInput';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { RegistrationProps } from '@/client/pages/Registration';
import { GeoLocation } from '@/shared/model/Geolocation';
import { registrationFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import { RegistrationConsents } from '@/client/components/RegistrationConsents';
import { AppName } from '@/shared/lib/appNameUtils';
import { newsletterAdditionalTerms } from '@/shared/model/Newsletter';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { Divider } from '@guardian/source-development-kitchen/react-components';
import { divider } from '@/client/styles/Shared';
import { MainBodyText } from '@/client/components/MainBodyText';
import ThemedLink from '@/client/components/ThemedLink';

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

	const useIdapi = queryParams.useIdapi;

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
					useIdapi={useIdapi}
					geolocation={geolocation}
					appName={appName}
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
