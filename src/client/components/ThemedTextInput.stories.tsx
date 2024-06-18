import { Meta } from '@storybook/react';
import React from 'react';
import ThemedTextInput from '@/client/components/ThemedTextInput';

export default {
	title: 'Components/ThemedTextInput',
	component: ThemedTextInput,
	parameters: {
		layout: 'padded',
	},
} as Meta;

export const Default = () => {
	return <ThemedTextInput label="Themed text input" />;
};
Default.storyName = 'default';

export const WithError = () => {
	return (
		<ThemedTextInput
			label="Themed text input with error"
			value="What are birds?"
			error="We just don't know."
		/>
	);
};
WithError.storyName = 'with error';

export const WithSuccess = () => {
	return (
		<ThemedTextInput
			label="Themed text input with success"
			value="What are birds?"
			success="Ding!"
		/>
	);
};
WithSuccess.storyName = 'with success';
