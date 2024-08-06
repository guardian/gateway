import type { Meta } from '@storybook/react';
import React from 'react';
import { RegistrationConsents } from '@/client/components/RegistrationConsents';

export default {
	title: 'Components/RegistrationConsents',
	component: RegistrationConsents,
	parameters: {
		layout: 'padded',
	},
} as Meta;

export const GB = () => {
	return <RegistrationConsents geolocation="GB" />;
};
GB.storyName = 'GB/EU geolocation';

export const US = () => {
	return <RegistrationConsents geolocation="US" />;
};
US.storyName = 'US geolocation';

export const AU = () => {
	return <RegistrationConsents geolocation="AU" />;
};
AU.storyName = 'AU geolocation';

export const Feast = () => {
	return <RegistrationConsents appName="Feast" />;
};
Feast.storyName = 'Feast app';

export const Jobs = () => {
	return <RegistrationConsents isJobs />;
};
Jobs.storyName = 'Jobs site';
