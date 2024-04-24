/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { ChangeEmailError } from '@/client/pages/ChangeEmailError';

export default {
	title: 'Pages/ChangeEmailError',
	component: ChangeEmailError,
	parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => <ChangeEmailError accountManagementUrl="#" />;
Default.story = {
	name: 'with defaults',
};
