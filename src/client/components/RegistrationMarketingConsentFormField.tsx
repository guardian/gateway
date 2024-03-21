import React from 'react';
import { ToggleSwitchInput } from './ToggleSwitchInput';

type Props = {
	id: string;
	description: string;
};

export const RegistrationMarketingConsentFormField = ({
	id,
	description,
}: Props) => {
	return (
		<ToggleSwitchInput
			id={id}
			description={description}
			defaultChecked={true}
		/>
	);
};
