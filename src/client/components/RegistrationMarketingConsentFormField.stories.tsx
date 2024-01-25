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
			label={RegistrationConsentsFormFields.similarGuardianProducts.label}
		/>
	);
};
Default.storyName = 'default';

export const NativeApp = () => {
	return (
		<RegistrationMarketingConsentFormField
			id={RegistrationConsentsFormFields.similarGuardianProducts.id}
			label={RegistrationConsentsFormFields.similarGuardianProducts.label}
			isNativeApp="android"
		/>
	);
};
NativeApp.storyName = 'NativeApp';
