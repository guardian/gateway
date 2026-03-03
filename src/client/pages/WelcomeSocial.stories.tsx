import React from 'react';
import { Meta } from '@storybook/react';

import {
	WelcomeSocial,
	WelcomeSocialProps,
} from '@/client/pages/WelcomeSocial';

export default {
	title: 'Pages/WelcomeSocial',
	component: WelcomeSocial,
	args: {
		queryParams: {
			returnUrl: 'https://www.theguardian.com/uk',
		},
	},
} as Meta<WelcomeSocialProps>;

export const Default = (args: WelcomeSocialProps) => (
	<WelcomeSocial {...args} />
);
Default.story = {
	name: 'with defaults',
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

export const GoogleOneTap = (args: WelcomeSocialProps) => (
	<WelcomeSocial {...args} isGoogleOneTap={true} />
);

GoogleOneTap.story = {
	name: 'with Google One Tap',
};
