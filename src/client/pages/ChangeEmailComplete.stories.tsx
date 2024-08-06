import type { Meta } from '@storybook/react';
import React from 'react';
import { ChangeEmailComplete } from '@/client/pages/ChangeEmailComplete';

export default {
	title: 'Pages/ChangeEmailComplete',
	component: ChangeEmailComplete,
} as Meta;

export const Default = () => (
	<ChangeEmailComplete accountManagementUrl="#" returnUrl="#" />
);
Default.story = {
	name: 'with defaults',
};
