import { Meta } from '@storybook/react';
import React from 'react';

import ThemedLink from '@/client/components/ThemedLink';

export default {
	title: 'Components/ThemedLink',
	component: ThemedLink,
	parameters: {
		layout: 'padded',
	},
} as Meta;

export const Default = () => <ThemedLink>Click me!</ThemedLink>;
Default.storyName = 'default';
