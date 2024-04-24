import React from 'react';
import { Meta } from '@storybook/react';

import { DeleteAccountEmailPasswordValidation } from '@/client/pages/DeleteAccountEmailPasswordValidation';

export default {
	title: 'Pages/DeleteAccountEmailPasswordValidation',
	component: DeleteAccountEmailPasswordValidation,
	parameters: { layout: 'fullscreen' },
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
