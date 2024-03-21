import React from 'react';
import { Meta } from '@storybook/react';

import { RegistrationMarketingConsentFormField } from './RegistrationMarketingConsentFormField';
import { RegistrationConsentsFormFields } from '@/shared/model/Consent';

export default {
	title: 'Components/RegistrationMarketingConsentFormField',
	component: RegistrationMarketingConsentFormField,
} as Meta;

export const Default = () => {
	return (
		<RegistrationMarketingConsentFormField
			id={RegistrationConsentsFormFields.similarGuardianProducts.id}
			description={RegistrationConsentsFormFields.similarGuardianProducts.label}
		/>
	);
};
Default.storyName = 'default';
