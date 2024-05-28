import React from 'react';
import { RegistrationConsentsFormFields } from '@/shared/model/Consent';
import {
	RegistrationNewsletterFormFields,
	RegistrationNewslettersFormFieldsMap,
} from '@/shared/model/Newsletter';
import { css } from '@emotion/react';
import { space } from '@guardian/source/foundations';
import { RegistrationMarketingConsentFormField } from '@/client/components/RegistrationMarketingConsentFormField';
import { RegistrationNewsletterFormField } from '@/client/components/RegistrationNewsletterFormField';
import { GeoLocation } from '@/shared/model/Geolocation';
import { AppName } from '@/shared/lib/appNameUtils';

interface RegistrationConsentsProps {
	geolocation?: GeoLocation;
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

const chooseNewsletter = (
	geolocation: GeoLocation | undefined,
	appName: AppName | undefined,
): RegistrationNewsletterFormFields | undefined => {
	const isFeast = appName === 'Feast';

	if (isFeast) {
		return RegistrationNewslettersFormFieldsMap.feast;
	}

	switch (geolocation) {
		case 'US':
			return RegistrationNewslettersFormFieldsMap.usBundle;
		case 'AU':
			return RegistrationNewslettersFormFieldsMap.auBundle;
		case 'GB':
		case 'EU':
		case 'ROW':
		default:
			// We want to show Saturday Edition even for an undefined location
			return RegistrationNewslettersFormFieldsMap.saturdayEdition;
	}
};

export const RegistrationConsents = ({
	geolocation,
	useIdapi,
	noMarginBottom,
	appName,
}: RegistrationConsentsProps) => {
	const registrationNewsletter = chooseNewsletter(geolocation, appName);
	// Show marketing consent if not showing Feast
	const showMarketingConsent = (() => {
		if (registrationNewsletter === RegistrationNewslettersFormFieldsMap.feast) {
			return false;
		}
		return true;
	})();

	if (useIdapi) {
		return <></>;
	}

	return (
		<div css={consentToggleCss(noMarginBottom)}>
			{registrationNewsletter && (
				<RegistrationNewsletterFormField
					id={registrationNewsletter.id}
					label={registrationNewsletter.label}
					context={registrationNewsletter.context}
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
