import React from 'react';
import { Meta } from '@storybook/react';

import { PasscodeUsed } from '@/client/pages/PasscodeUsed';

export default {
	title: 'Pages/PasscodeUsed',
	component: PasscodeUsed,
} as Meta;

export const CreateAccountPasscodeUsed = () => (
	<PasscodeUsed path="/welcome" queryParams={{ returnUrl: '#' }} />
);
CreateAccountPasscodeUsed.story = {
	name: 'with path /welcome',
};

export const ResetPasswordPasscodeUsed = () => (
	<PasscodeUsed path="/reset-password" queryParams={{ returnUrl: '#' }} />
);
ResetPasswordPasscodeUsed.story = {
	name: 'with path /reset-password',
};

export const SetPasswordPasscodeUsed = () => (
	<PasscodeUsed path="/set-password" queryParams={{ returnUrl: '#' }} />
);
SetPasswordPasscodeUsed.story = {
	name: 'with path /set-password',
};
