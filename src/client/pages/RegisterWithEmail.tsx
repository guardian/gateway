import React from 'react';
import { MainLayout } from '@/client/layouts/Main';
import { MainForm } from '@/client/components/MainForm';
import { EmailInput } from '@/client/components/EmailInput';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { CmpConsentedStateHiddenInput } from '@/client/components/CmpConsentStateHiddenInput';
import { useCmpConsent } from '@/client/lib/hooks/useCmpConsent';
import { RegistrationProps } from '@/client/pages/Registration';
import { generateSignInRegisterTabs } from '@/client/components/Nav';
import { RegistrationMarketingConsentFormField } from '@/client/components/RegistrationMarketingConsentFormField';
import { RegistrationNewsletterFormField } from '@/client/components/RegistrationNewsletterFormField';
import { GeoLocation } from '@/shared/model/Geolocation';
import { SATURDAY_EDITION_SMALL_SQUARE_IMAGE } from '@/client/assets/newsletters';
import { RegistrationConsentsFormFields } from '@/shared/model/Consent';
import { RegistrationNewslettersFormFields } from '@/shared/model/Newsletter';
import { registrationFormSubmitOphanTracking } from '@/client/lib/consentsTracking';

export type RegisterWithEmailProps = RegistrationProps & {
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

	const tabs = generateSignInRegisterTabs({
		queryParams,
		isActive: 'register',
	});

	const useIdapi = queryParams.useIdapi;

	// don't show the Saturday Edition newsletter option for US and AUS
	const showSaturdayEdition = !(['US', 'AU'] as GeoLocation[]).some(
		(location: GeoLocation) => location === geolocation,
	);

	return (
		<MainLayout tabs={tabs} pageHeader="Enter your email">
			<MainForm
				formAction={buildUrlWithQueryParams('/register', {}, queryParams)}
				submitButtonText="Register"
				recaptchaSiteKey={recaptchaSiteKey}
				formTrackingName={formTrackingName}
				disableOnSubmit
				formErrorMessageFromParent={formError}
				onSubmit={(e) => {
					registrationFormSubmitOphanTracking(e.target as HTMLFormElement);
					return undefined;
				}}
			>
				<EmailInput defaultValue={email} autoComplete="off" />
				<CmpConsentedStateHiddenInput cmpConsentedState={hasCmpConsent} />

				{!useIdapi && (
					<>
						{showSaturdayEdition && (
							<RegistrationNewsletterFormField
								id={RegistrationNewslettersFormFields.saturdayEdition.id}
								label={RegistrationNewslettersFormFields.saturdayEdition.label}
								context={
									RegistrationNewslettersFormFields.saturdayEdition.context
								}
								imagePath={SATURDAY_EDITION_SMALL_SQUARE_IMAGE}
							/>
						)}
						<RegistrationMarketingConsentFormField
							id={RegistrationConsentsFormFields.similarGuardianProducts.id}
							label={
								RegistrationConsentsFormFields.similarGuardianProducts.label
							}
						/>
					</>
				)}
			</MainForm>
		</MainLayout>
	);
};
