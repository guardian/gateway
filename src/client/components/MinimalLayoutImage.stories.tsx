import { Meta } from '@storybook/preact';
import React from 'react';

import { MinimalLayoutImage } from '@/client/components/MinimalLayoutImage';

export default {
	title: 'Components/MinimalLayoutImage',
	component: MinimalLayoutImage,
	parameters: {
		layout: 'padded',
	},
} as Meta;

export const Email = () => <MinimalLayoutImage id="email" />;

export const Welcome = () => <MinimalLayoutImage id="welcome" />;
