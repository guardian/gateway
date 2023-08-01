import React from 'react';
import { Meta } from '@storybook/react';

import { DeleteAccountEmailValidation } from './DeleteAccountEmailValidation';

export default {
	title: 'Pages/DeleteAccountEmailValidation',
	component: DeleteAccountEmailValidation,
	parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => <DeleteAccountEmailValidation />;
Default.story = {
	name: 'with defaults',
};
