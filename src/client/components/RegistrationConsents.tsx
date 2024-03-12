import React from 'react';
import { RegistrationConsentsFormFields } from '@/shared/model/Consent';
import {
	RegistrationNewsletterFormFields,
	RegistrationNewslettersFormFieldsMap,
} from '@/shared/model/Newsletter';
import { GeoLocation } from '@/shared/model/Geolocation';
import { AppName } from '@/shared/lib/appNameUtils';
import { ToggleSwitchList } from '@/client/components/ToggleSwitchList';
import { ToggleSwitchInput } from '@/client/components/ToggleSwitchInput';

interface RegistrationConsentsProps {
	geolocation?: GeoLocation;
	useIdapi?: boolean;
	appName?: AppName;
}

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
		<ToggleSwitchList>
			{registrationNewsletter && (
				<ToggleSwitchInput
					id={registrationNewsletter.id}
					title={registrationNewsletter.label}
					description={registrationNewsletter.context}
					defaultChecked={true}
				/>
			)}
			{showMarketingConsent && (
				<ToggleSwitchInput
					id={RegistrationConsentsFormFields.similarGuardianProducts.id}
					description={
						RegistrationConsentsFormFields.similarGuardianProducts.label
					}
					defaultChecked={true}
				/>
			)}
		</ToggleSwitchList>
	);
};
