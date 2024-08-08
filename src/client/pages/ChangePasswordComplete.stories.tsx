import React from 'react';
import { Meta } from '@storybook/react';

import { ChangePasswordComplete } from '@/client/pages/ChangePasswordComplete';

export default {
	title: 'Pages/ChangePasswordComplete',
	component: ChangePasswordComplete,
} as Meta;

export const Default = () => (
	<ChangePasswordComplete headerText="Password updated" action="updated" />
);
Default.story = {
	name: 'with defaults',
};

export const Email = () => (
	<ChangePasswordComplete
		headerText="Password updated"
		email="example@theguardian.com"
		action="updated"
	/>
);
Email.story = {
	name: 'with email',
};

export const ReturnUrl = () => (
	<ChangePasswordComplete
		headerText="Password updated"
		email="example@theguardian.com"
		returnUrl="https://theguardian.com"
		action="updated"
	/>
);
ReturnUrl.story = {
	name: 'with email and return url',
};
