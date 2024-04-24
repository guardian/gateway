import React from 'react';
import { Meta } from '@storybook/react';

import { PasswordFormMainLayout } from '@/client/components/PasswordForm';

export default {
	title: 'Components/PasswordFormMainLayout',
	component: PasswordFormMainLayout,
} as Meta;

export const Default = () => (
	<PasswordFormMainLayout
		submitUrl=""
		fieldErrors={[]}
		submitButtonText="Confirm new password"
		labelText="New password"
	/>
);
Default.storyName = 'default';

export const FieldError = () => (
	<PasswordFormMainLayout
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
