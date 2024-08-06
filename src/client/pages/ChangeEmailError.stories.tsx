import type { Meta } from '@storybook/react';
import React from 'react';
import { ChangeEmailError } from '@/client/pages/ChangeEmailError';

export default {
	title: 'Pages/ChangeEmailError',
	component: ChangeEmailError,
} as Meta;

export const Default = () => <ChangeEmailError accountManagementUrl="#" />;
Default.story = {
	name: 'with defaults',
};
