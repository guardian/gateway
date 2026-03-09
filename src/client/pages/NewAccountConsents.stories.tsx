import React from 'react';
import { Meta } from '@storybook/react';

import {
	NewAccountConsents,
	NewAccountConsentsProps,
} from '@/client/pages/NewAccountConsents';

export default {
	title: 'Pages/NewAccountConsents',
	component: NewAccountConsents,
	args: {
		appName: 'Guardian',
		queryParams: {},
	},
} as Meta<NewAccountConsentsProps>;
export const Default = (args: NewAccountConsentsProps) => (
	<NewAccountConsents {...args} />
);

export const WithFeast = (args: NewAccountConsentsProps) => (
	<NewAccountConsents {...args} appName="Feast" />
);

export const WithJobsRegistration = (args: NewAccountConsentsProps) => (
	<NewAccountConsents
		{...args}
		queryParams={{ clientId: 'jobs', returnUrl: '' }}
		signInOrRegister="REGISTER"
	/>
);

export const WithJobsSignIn = (args: NewAccountConsentsProps) => (
	<NewAccountConsents
		{...args}
		queryParams={{ clientId: 'jobs', returnUrl: '' }}
		signInOrRegister="SIGNIN"
	/>
);
