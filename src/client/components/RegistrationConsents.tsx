import React from 'react';
import { getRegistrationConsentsList } from '@/shared/model/Consent';
import { GeoLocation } from '@/shared/model/Geolocation';
import { AppName } from '@/shared/lib/appNameUtils';
import { ToggleSwitchList } from '@/client/components/ToggleSwitchList';
import { ToggleSwitchInput } from '@/client/components/ToggleSwitchInput';

interface RegistrationConsentsProps {
	geolocation?: GeoLocation;
	appName?: AppName;
	isJobs?: boolean;
	onChange?: (id: string, checked: boolean) => void;
}

export const RegistrationConsents = ({
	geolocation,
	appName,
	isJobs,
	onChange,
}: RegistrationConsentsProps) => {
	const consentList = getRegistrationConsentsList(
		isJobs ?? false,
		geolocation,
		appName,
	);
	return (
		<ToggleSwitchList>
			{consentList.map((consentItem) => (
				<ToggleSwitchInput
					id={consentItem.id}
					title={consentItem.title}
					description={consentItem.description}
					defaultChecked={true}
					onChange={onChange}
				/>
			))}
		</ToggleSwitchList>
	);
};

export const changeSettingsTerms =
	'You can change your settings in the Data Privacy section of your Guardian account at any time.';
