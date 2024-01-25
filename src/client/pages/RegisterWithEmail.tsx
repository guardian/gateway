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
import { IsNativeApp } from '@/shared/model/ClientState';
import { RegistrationNewsletterFormField } from '@/client/components/RegistrationNewsletterFormField';
import { GeoLocation } from '@/shared/model/Geolocation';
import { SATURDAY_EDITION_SMALL_SQUARE_IMAGE } from '@/client/assets/newsletters';
import { RegistrationConsentsFormFields } from '@/shared/model/Consent';
import { RegistrationNewslettersFormFields } from '@/shared/model/Newsletter';

export type RegisterWithEmailProps = RegistrationProps & {
	isNativeApp?: IsNativeApp;
	geolocation?: GeoLocation;
};

export const RegisterWithEmail = ({
	email,
	recaptchaSiteKey,
	queryParams,
	formError,
	isNativeApp,
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
	const showSaturdayEdition = !(['US', 'AUS'] as GeoLocation[]).some(
		(location: GeoLocation) => location === geolocation,
	);

	return (
		<MainLayout tabs={tabs}>
			<MainForm
				formAction={buildUrlWithQueryParams('/register', {}, queryParams)}
				submitButtonText="Register"
				recaptchaSiteKey={recaptchaSiteKey}
				formTrackingName={formTrackingName}
				disableOnSubmit
				formErrorMessageFromParent={formError}
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
								isNativeApp={isNativeApp}
								imagePath={SATURDAY_EDITION_SMALL_SQUARE_IMAGE}
							/>
						)}
						<RegistrationMarketingConsentFormField
							id={RegistrationConsentsFormFields.similarGuardianProducts.id}
							label={
								RegistrationConsentsFormFields.similarGuardianProducts.label
							}
							isNativeApp={isNativeApp}
						/>
					</>
				)}
			</MainForm>
		</MainLayout>
	);
};
