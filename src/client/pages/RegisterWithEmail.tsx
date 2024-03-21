import React from 'react';
import { MainForm } from '@/client/components/MainForm';
import { EmailInput } from '@/client/components/EmailInput';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { CmpConsentedStateHiddenInput } from '@/client/components/CmpConsentStateHiddenInput';
import { useCmpConsent } from '@/client/lib/hooks/useCmpConsent';
import { RegistrationProps } from '@/client/pages/Registration';
import { GeoLocation } from '@/shared/model/Geolocation';
import { registrationFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import { RegistrationConsents } from '@/client/components/RegistrationConsents';
import { MinimalLayout } from '../layouts/MinimalLayout';

type RegisterWithEmailProps = RegistrationProps & {
	geolocation?: GeoLocation;
};

export const RegisterWithEmail = ({
	email,
	recaptchaSiteKey,
	queryParams,
	formError,
	geolocation,
}: RegisterWithEmailProps) => {
	const formTrackingName = 'register';

	usePageLoadOphanInteraction(formTrackingName);

	const hasCmpConsent = useCmpConsent();

	const useIdapi = queryParams.useIdapi;

	return (
		<MinimalLayout pageHeader="Enter your email">
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
				additionalTerms="Newsletters may contain info about charities, online ads, and content funded by outside parties."
			>
				<EmailInput defaultValue={email} autoComplete="off" />
				<CmpConsentedStateHiddenInput cmpConsentedState={hasCmpConsent} />
				<RegistrationConsents useIdapi={useIdapi} geolocation={geolocation} />
			</MainForm>
		</MinimalLayout>
	);
};
