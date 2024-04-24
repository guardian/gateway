import React from 'react';
import { Meta } from '@storybook/react';

import { Registration, RegistrationProps } from '@/client/pages/Registration';

export default {
	title: 'Pages/Registration',
	component: Registration,
	parameters: { layout: 'fullscreen' },
	args: {
		queryParams: {
			returnUrl: 'https://www.theguardian.com/uk',
		},
	},
} as Meta<RegistrationProps>;

export const Default = (args: RegistrationProps) => <Registration {...args} />;
Default.story = {
	name: 'with defaults',
};

export const WithJobs = (args: RegistrationProps) => (
	<Registration
		{...{ ...args, queryParams: { ...args.queryParams, clientId: 'jobs' } }}
	/>
);
WithJobs.story = {
	name: 'with Jobs terms',
};
