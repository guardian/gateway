import type { Meta } from '@storybook/react';
import React from 'react';
import NameInputField from '@/client/components/NameInputField';

export default {
	title: 'Components/NameInputField',
	component: NameInputField,
	parameters: {
		layout: 'padded',
	},
} as Meta;

export const Default = () => {
	return <NameInputField />;
};
Default.storyName = 'default';

export const DefaultNameValues = () => {
	return <NameInputField firstName="John" secondName="Smith" />;
};
DefaultNameValues.storyName = 'with default values';
