import type { Meta } from '@storybook/react';
import React from 'react';
import type { WelcomeSocialProps } from '@/client/pages/WelcomeSocial';
import { WelcomeSocial } from '@/client/pages/WelcomeSocial';

export default {
	title: 'Pages/WelcomeSocial',
	component: WelcomeSocial,
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

export const GBGeolocation = (args: WelcomeSocialProps) => (
	<WelcomeSocial {...args} geolocation="GB" />
);
GBGeolocation.story = {
	name: 'with GB geolocation',
};

export const USGeolocation = (args: WelcomeSocialProps) => (
	<WelcomeSocial {...args} geolocation="US" />
);
USGeolocation.story = {
	name: 'with US geolocation',
};

export const FeastApp = (args: WelcomeSocialProps) => (
	<WelcomeSocial {...args} appName="Feast" />
);
FeastApp.story = {
	name: 'with Feast app',
};

export const JobsSite = (args: WelcomeSocialProps) => (
	<WelcomeSocial {...args} queryParams={{ clientId: 'jobs', returnUrl: '#' }} />
);

JobsSite.story = {
	name: 'with Jobs site',
};
