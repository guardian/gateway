import React from 'react';
import { Meta } from '@storybook/react';

import { RegistrationMarketingConsentFormField } from './RegistrationMarketingConsentFormField';

export default {
	title: 'Components/RegistrationMarketingConsentFormField',
	component: RegistrationMarketingConsentFormField,
} as Meta;

export const Default = () => {
	return <RegistrationMarketingConsentFormField />;
};
Default.storyName = 'default';
