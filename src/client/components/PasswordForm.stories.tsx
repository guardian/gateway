import React from 'react';
import { Meta } from '@storybook/react';

import { PasswordForm } from '@/client/components/PasswordForm';

export default {
	title: 'Components/PasswordForm',
	component: PasswordForm,
} as Meta;

export const Default = () => (
	<PasswordForm
		submitUrl=""
		fieldErrors={[]}
		submitButtonText="Save password"
		labelText="New Password"
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
		submitButtonText="Save password"
		labelText="New Password"
	/>
);
FieldError.storyName = 'With field error';
