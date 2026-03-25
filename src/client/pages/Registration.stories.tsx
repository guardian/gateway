import React from 'react';
import { Meta } from '@storybook/preact';

import { Registration, RegistrationProps } from '@/client/pages/Registration';

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

export const WithPrintPromo = (args: RegistrationProps) => (
	<Registration
		{...{
			...args,
			queryParams: { ...args.queryParams, clientId: 'printpromo' },
		}}
	/>
);
WithPrintPromo.story = {
	name: 'with Print Promo lead text',
};
