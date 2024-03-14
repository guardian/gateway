import React from 'react';
import { Meta } from '@storybook/react';

import { PasswordForm } from './PasswordForm';

export default {
	title: 'Components/PasswordForm',
	component: PasswordForm,
} as Meta;

export const Default = () => (
	<PasswordForm
		submitUrl=""
		fieldErrors={[]}
		submitButtonText="Confirm new password"
		labelText="New password"
	/>
);
Default.storyName = 'default';

export const FieldError = () => (
	<PasswordForm
		submitUrl=""
		fieldErrors={[
			{
				field: 'password',
				message: 'This is a field error',
			},
		]}
		submitButtonText="Confirm new password"
		labelText="New password"
	/>
);
FieldError.storyName = 'With field error';
