import React from 'react';
import { Meta } from '@storybook/react';

import {
	WelcomeExisting,
	WelcomeExistingProps,
} from '@/client/pages/WelcomeExisting';

export default {
	title: 'Pages/WelcomeExisting',
	component: WelcomeExisting,
	args: {
		queryParams: {
			returnUrl: 'https://www.theguardian.com/uk',
		},
	},
} as Meta<WelcomeExistingProps>;

export const Default = (args: WelcomeExistingProps) => (
	<WelcomeExisting {...args} />
);
Default.story = {
	name: 'default',
};

export const WithEmail = (args: WelcomeExistingProps) => (
	<WelcomeExisting {...args} email="test@example.com" />
);
WithEmail.story = {
	name: 'with email',
};
