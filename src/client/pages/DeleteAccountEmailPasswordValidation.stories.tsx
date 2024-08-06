import type { Meta } from '@storybook/react';
import React from 'react';
import { DeleteAccountEmailPasswordValidation } from '@/client/pages/DeleteAccountEmailPasswordValidation';

export default {
	title: 'Pages/DeleteAccountEmailPasswordValidation',
	component: DeleteAccountEmailPasswordValidation,
} as Meta;

export const Email = () => (
	<DeleteAccountEmailPasswordValidation
		validationType="email"
		queryParams={{ returnUrl: '#' }}
	/>
);
Email.story = {
	name: 'with validationType email',
};

export const Password = () => (
	<DeleteAccountEmailPasswordValidation
		validationType="password"
		queryParams={{ returnUrl: '#' }}
	/>
);
Password.story = {
	name: 'with validationType password',
};
