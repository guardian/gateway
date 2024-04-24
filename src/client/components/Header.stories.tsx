import React from 'react';
import { Meta } from '@storybook/react';

import { Header } from '@/client/components/Header';

export default {
	title: 'Components/Header',
	component: Header,
	parameters: { layout: 'fullscreen' },
} as Meta;

export const Desktop = () => <Header />;
Desktop.storyName = 'At desktop';
Desktop.parameters = {
	viewport: {
		defaultViewport: 'DESKTOP',
	},
};

export const Tablet = () => <Header />;
Tablet.storyName = 'At tablet';
Tablet.parameters = {
	viewport: {
		defaultViewport: 'TABLET',
	},
};

export const Mobile = () => <Header />;
Mobile.storyName = 'At mobile';
Mobile.parameters = {
	viewport: {
		defaultViewport: 'MOBILE',
	},
};

export const GeoGB = () => <Header />;
GeoGB.storyName = 'with defaults';

export const Jobs = () => <Header isJobs={true} />;
Jobs.storyName = 'on Jobs';

export const OnNativeApp = () => <Header isNativeApp={'android'} />;
OnNativeApp.storyName = 'on native app';
