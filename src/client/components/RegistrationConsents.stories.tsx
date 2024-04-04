import React from 'react';
import { Meta } from '@storybook/react';

import { RegistrationConsents } from '@/client/components/RegistrationConsents';

export default {
	title: 'Components/RegistrationConsents',
	component: RegistrationConsents,
} as Meta;

export const Default = () => {
	return <RegistrationConsents geolocation="GB" />;
};
Default.storyName = 'default';

export const US = () => {
	return <RegistrationConsents geolocation="US" />;
};
US.storyName = 'US geolocation';

export const NoMarginBottom = () => {
	return <RegistrationConsents geolocation="GB" noMarginBottom />;
};
NoMarginBottom.storyName = 'NoMarginBottom';
