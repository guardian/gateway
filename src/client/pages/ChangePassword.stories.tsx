import React from 'react';
import { Meta } from '@storybook/react';

import { ChangePassword } from '@/client/pages/ChangePassword';

export default {
	title: 'Pages/ChangePassword',
	component: ChangePassword,
	parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => (
	<ChangePassword
		headerText="Reset password"
		buttonText="Confirm new password"
		submitUrl=""
		email="example@theguardian.com"
		fieldErrors={[]}
	/>
);
Default.story = {
	name: 'with defaults',
};

export const FieldErrorPW = () => (
	<ChangePassword
		headerText="Reset password"
		buttonText="Confirm new password"
		submitUrl=""
		email="example@theguardian.com"
		fieldErrors={[
			{
				field: 'password',
				message: 'Not right',
			},
		]}
	/>
);
FieldErrorPW.story = {
	name: 'with error on password',
};

export const SetPassword = () => (
	<ChangePassword
		headerText="Create password"
		buttonText="Save password"
		submitUrl=""
		email="example@theguardian.com"
		fieldErrors={[]}
	/>
);
SetPassword.story = {
	name: 'set password page',
};
