import React from 'react';
import { Meta } from '@storybook/react';

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
		shortRequestId="123e4567"
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
		shortRequestId="123e4567"
	/>
);
FieldError.storyName = 'With field error';
