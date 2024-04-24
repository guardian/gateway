import React from 'react';
import { Meta } from '@storybook/react';
import { JobsLogo } from '@/client/components/JobsLogo';

export default {
	title: 'Components/JobsLogo',
	component: JobsLogo,
	parameters: { layout: 'fullscreen' },
} as Meta;

export const Desktop = () => <JobsLogo />;
Desktop.storyName = 'At desktop';
Desktop.parameters = {
	viewport: {
		defaultViewport: 'DESKTOP',
	},
};

export const Tablet = () => <JobsLogo />;
Tablet.storyName = 'At tablet';
Tablet.parameters = {
	viewport: {
		defaultViewport: 'TABLET',
	},
};

export const Mobile = () => <JobsLogo />;
Mobile.storyName = 'At mobile';
Mobile.parameters = {
	viewport: {
		defaultViewport: 'MOBILE',
	},
};
