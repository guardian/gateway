import React from 'react';
import { Meta } from '@storybook/react';

import { AuthProviderButtons } from './AuthProviderButtons';

export default {
	title: 'Components/AuthProviderButtons',
	component: AuthProviderButtons,
} as Meta;

export const Desktop = () => (
	<AuthProviderButtons
		context="Sign in"
		queryParams={{ returnUrl: 'https://www.theguardian.com/uk/' }}
		providers={['social']}
	/>
);
Desktop.storyName = 'At desktop';
Desktop.parameters = {
	viewport: {
		defaultViewport: 'DESKTOP',
	},
	chromatic: { viewports: [1300] },
};

export const Mobile = () => (
	<AuthProviderButtons
		context="Sign in"
		queryParams={{ returnUrl: 'https://www.theguardian.com/uk/' }}
		providers={['social']}
	/>
);
Mobile.storyName = 'At mobile 320';
Mobile.parameters = {
	viewport: {
		defaultViewport: 'MOBILE_320',
	},
	chromatic: { viewports: [320] },
};

export const NativeAppAndroid = () => (
	<AuthProviderButtons
		context="Sign in"
		queryParams={{ returnUrl: 'https://www.theguardian.com/uk/' }}
		isNativeApp="android"
		providers={['social']}
	/>
);
NativeAppAndroid.storyName = 'Android native app';

export const NativeAppIos = () => (
	<AuthProviderButtons
		context="Sign in"
		queryParams={{ returnUrl: 'https://www.theguardian.com/uk/' }}
		isNativeApp="ios"
		providers={['social']}
	/>
);
NativeAppIos.storyName = 'iOS native app';

export const DesktopWithEmail = () => (
	<AuthProviderButtons
		context="Sign in"
		queryParams={{ returnUrl: 'https://www.theguardian.com/uk/' }}
		providers={['social', 'email']}
	/>
);
DesktopWithEmail.storyName = 'At desktop (with email)';
DesktopWithEmail.parameters = {
	viewport: {
		defaultViewport: 'DESKTOP',
	},
	chromatic: { viewports: [1300] },
};

export const MobileWithEmail = () => (
	<AuthProviderButtons
		context="Sign in"
		queryParams={{ returnUrl: 'https://www.theguardian.com/uk/' }}
		providers={['social', 'email']}
	/>
);
MobileWithEmail.storyName = 'At mobile 320 (with email)';
MobileWithEmail.parameters = {
	viewport: {
		defaultViewport: 'MOBILE_320',
	},
	chromatic: { viewports: [320] },
};

export const NativeAppAndroidWithEmail = () => (
	<AuthProviderButtons
		context="Sign in"
		queryParams={{ returnUrl: 'https://www.theguardian.com/uk/' }}
		isNativeApp="android"
		providers={['social', 'email']}
	/>
);
NativeAppAndroidWithEmail.storyName = 'Android native app (with email)';

export const NativeAppIosWithEmail = () => (
	<AuthProviderButtons
		context="Sign in"
		queryParams={{ returnUrl: 'https://www.theguardian.com/uk/' }}
		isNativeApp="ios"
		providers={['social', 'email']}
	/>
);
NativeAppIosWithEmail.storyName = 'iOS native app (with email)';
