import React from 'react';
import { RegistrationConsentsFormFields } from '@/shared/model/Consent';
import { RegistrationNewslettersFormFields } from '@/shared/model/Newsletter';
import { css } from '@emotion/react';
import { space } from '@guardian/source-foundations';
import { RegistrationMarketingConsentFormField } from '@/client/components/RegistrationMarketingConsentFormField';
import { RegistrationNewsletterFormField } from '@/client/components/RegistrationNewsletterFormField';
import { GeoLocation } from '@/shared/model/Geolocation';
import { AppName } from '@/shared/lib/appNameUtils';

interface RegistrationConsentsProps {
	geolocation?: string;
	useIdapi?: boolean;
	noMarginBottom?: boolean;
	appName?: AppName;
}

const consentToggleCss = (noMarginBottom = false) => css`
	display: flex;
	margin-top: ${space[6]}px;
	${noMarginBottom ? 'margin-bottom: 0;' : `margin-bottom: ${space[4]}px;`}
	flex-direction: column;
	gap: ${space[3]}px;
`;

export const RegistrationConsents = ({
	geolocation,
	useIdapi,
	noMarginBottom,
	appName,
}: RegistrationConsentsProps) => {
	// check if the app is Feast or not
	const isFeast = appName === 'Feast';

	// don't show the Saturday Edition newsletter option for US and AUS or if using Feast app
	const showSaturdayEdition = (() => {
		const isValidLocation = !(['US', 'AU'] satisfies GeoLocation[]).some(
			(location: GeoLocation) => location === geolocation,
		);

		return isValidLocation && !isFeast;
	})();

	// show the Feast newsletter option if the app is Feast and Saturday Edition is not shown
	const showFeast = isFeast && !showSaturdayEdition;

	// Show marketing consent if not showing Feast
	const showMarketingConsent = !showFeast;

	if (useIdapi) {
		return <></>;
	}

	return (
		<div css={consentToggleCss(noMarginBottom)}>
			{showSaturdayEdition && (
				<RegistrationNewsletterFormField
					id={RegistrationNewslettersFormFields.saturdayEdition.id}
					label={`${RegistrationNewslettersFormFields.saturdayEdition.label} newsletter`}
					context={RegistrationNewslettersFormFields.saturdayEdition.context}
				/>
			)}
			{showFeast && (
				<RegistrationNewsletterFormField
					id={RegistrationNewslettersFormFields.feast.id}
					label={`${RegistrationNewslettersFormFields.feast.label} newsletter`}
					context={RegistrationNewslettersFormFields.feast.context}
				/>
			)}
			{showMarketingConsent && (
				<RegistrationMarketingConsentFormField
					id={RegistrationConsentsFormFields.similarGuardianProducts.id}
					label={RegistrationConsentsFormFields.similarGuardianProducts.label}
				/>
			)}
		</div>
	);
};
