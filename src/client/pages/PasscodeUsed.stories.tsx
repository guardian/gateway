import React from 'react';
import { Meta } from '@storybook/react';

import { PasscodeUsed } from '@/client/pages/PasscodeUsed';

export default {
	title: 'Pages/PasscodeUsed',
	component: PasscodeUsed,
} as Meta;

export const Defaults = () => <PasscodeUsed queryParams={{ returnUrl: '#' }} />;
Defaults.story = {
	name: 'with defaults',
};
