import React from 'react';
import { Meta } from '@storybook/react';

import { WelcomeSocial, WelcomeSocialProps } from './WelcomeSocial';

export default {
	title: 'Pages/WelcomeSocial',
	component: WelcomeSocial,
	parameters: { layout: 'fullscreen' },
	args: {
		queryParams: {
			returnUrl: 'https://www.theguardian.com/uk',
		},
		socialProvider: 'google',
	},
} as Meta<WelcomeSocialProps>;

export const Google = (args: WelcomeSocialProps) => <WelcomeSocial {...args} />;
Google.story = {
	name: 'with Google',
};

export const Apple = (args: WelcomeSocialProps) => (
	<WelcomeSocial {...args} socialProvider="apple" />
);
Apple.story = {
	name: 'with Apple',
};

export const ReturnUrl = (args: WelcomeSocialProps) => (
	<WelcomeSocial
		{...args}
		queryParams={{ returnUrl: 'https://www.theguardian.com/uk' }}
	/>
);
ReturnUrl.story = {
	name: 'with returnUrl',
};
