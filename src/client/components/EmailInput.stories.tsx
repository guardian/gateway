import React from 'react';
import { Meta } from '@storybook/react';

import { EmailInput } from '@/client/components/EmailInput';
import { InputFieldStates } from '@/client/lib/hooks/useInputValidityState';

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
	<EmailInput defaultValue="" initialState={InputFieldStates.EMPTY} />
);
WithEmptyError.storyName = 'with empty error';

export const WithInvalidError = () => (
	<EmailInput
		defaultValue="invalid.email"
		initialState={InputFieldStates.INVALID}
	/>
);
WithInvalidError.storyName = 'with invalid error';
