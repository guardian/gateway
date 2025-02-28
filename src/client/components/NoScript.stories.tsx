import React from 'react';
import { Meta } from '@storybook/react';

import { NoScript } from '@/client/components/NoScript';

export default {
	title: 'Components/NoScript',
	component: NoScript,
	parameters: {
		layout: 'padded',
	},
} as Meta;

export const Default = () => <NoScript />;
Default.storyName = 'default';
