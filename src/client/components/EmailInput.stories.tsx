import React from 'react';
import { Meta } from '@storybook/react';

import { EmailInput } from '@/client/components/EmailInput';
import { InputFieldState } from '@/client/lib/hooks/useInputValidityState';

export default {
	title: 'Components/EmailInput',
	component: EmailInput,
} as Meta;

export const Default = () => {
	return <EmailInput defaultValue="email@email.com" />;
};
Default.storyName = 'default';

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
