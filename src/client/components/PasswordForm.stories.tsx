import type { Meta } from '@storybook/react';
import React from 'react';
import { PasswordForm } from '@/client/components/PasswordForm';

export default {
	title: 'Components/PasswordForm',
	component: PasswordForm,
	parameters: {
		layout: 'padded',
	},
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
