import { Meta } from '@storybook/react';
import React from 'react';
import IframeThemedEmailInput from '@/client/components/IframeThemedEmailInput';

export default {
	title: 'Components/IframeThemedEmailInput',
	component: IframeThemedEmailInput,
	parameters: {
		layout: 'padded',
	},
} as Meta;

export const Default = () => {
	return <IframeThemedEmailInput label="Themed text input" />;
};
Default.storyName = 'default';
