import type { Meta } from '@storybook/react';
import React from 'react';
import type { RegistrationProps } from '@/client/pages/Registration';
import { Registration } from '@/client/pages/Registration';

export default {
	title: 'Pages/Registration',
	component: Registration,
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
