import React from 'react';
import { Meta } from '@storybook/react';

import { PasscodeInput } from '@/client/components/PasscodeInput';

export default {
	title: 'Components/PasscodeInput',
	component: PasscodeInput,
	parameters: {
		layout: 'padded',
	},
} as Meta;

export const Default = () => {
	return <PasscodeInput label="Verification code" />;
};
Default.storyName = 'default';

export const WithFieldError = () => (
	<PasscodeInput
		label="Verification code"
		fieldErrors={[{ field: 'code', message: 'Invalid code' }]}
	/>
);
WithFieldError.storyName = 'with field error';

export const WithDefaultPasscode = () => (
	<PasscodeInput label="Verification code" passcode="424242" />
);
WithDefaultPasscode.storyName = 'with default passcode';

export const WithFieldErrorAndDefaultPasscode = () => (
	<PasscodeInput
		label="Verification code"
		passcode="424242"
		fieldErrors={[{ field: 'code', message: 'Invalid code' }]}
	/>
);
WithFieldErrorAndDefaultPasscode.storyName =
	'with field error and default passcode';
