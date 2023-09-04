import React from 'react';
import { Meta } from '@storybook/react';

import { DeleteAccountEmailPasswordValidation } from './DeleteAccountEmailPasswordValidation';

export default {
	title: 'Pages/DeleteAccountEmailPasswordValidation',
	component: DeleteAccountEmailPasswordValidation,
	parameters: { layout: 'fullscreen' },
} as Meta;

export const Email = () => (
	<DeleteAccountEmailPasswordValidation validationType="email" />
);
Email.story = {
	name: 'with validationType email',
};

export const Password = () => (
	<DeleteAccountEmailPasswordValidation validationType="password" />
);
Password.story = {
	name: 'with validationType password',
};
