import type { Meta } from '@storybook/react';
import React from 'react';
import { EmailInput } from '@/client/components/EmailInput';
import { InputFieldState } from '@/client/lib/hooks/useInputValidityState';

export default {
	title: 'Components/EmailInput',
	component: EmailInput,
	parameters: {
		layout: 'padded',
	},
} as Meta;

export const Default = () => {
	return <EmailInput />;
};
Default.storyName = 'default';

export const WithEmail = () => {
	return <EmailInput defaultValue="email@email.com" />;
};
WithEmail.storyName = 'with email';

export const WithEmptyError = () => (
	<EmailInput defaultValue="" initialState={InputFieldState.EMPTY} />
);
WithEmptyError.storyName = 'with empty error';

export const WithInvalidError = () => (
	<EmailInput
		defaultValue="invalid.email"
		initialState={InputFieldState.INVALID}
	/>
);
WithInvalidError.storyName = 'with invalid error';
