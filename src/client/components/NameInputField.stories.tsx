import React from 'react';
import { Meta } from '@storybook/react';

import NameInputField from '@/client/components/NameInputField';

export default {
	title: 'Components/NameInputField',
	component: NameInputField,
} as Meta;

export const Default = () => {
	return <NameInputField />;
};
Default.storyName = 'default';

export const DefaultNameValues = () => {
	return <NameInputField firstName="John" secondName="Smith" />;
};
DefaultNameValues.storyName = 'with default values';
