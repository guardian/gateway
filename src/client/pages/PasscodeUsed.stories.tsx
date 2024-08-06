import type { Meta } from '@storybook/react';
import React from 'react';
import { PasscodeUsed } from '@/client/pages/PasscodeUsed';

export default {
	title: 'Pages/PasscodeUsed',
	component: PasscodeUsed,
} as Meta;

export const Defaults = () => <PasscodeUsed queryParams={{ returnUrl: '#' }} />;
Defaults.story = {
	name: 'with defaults',
};
