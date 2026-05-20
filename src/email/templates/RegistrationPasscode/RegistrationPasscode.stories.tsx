import React from 'react';
import { Meta } from '@storybook/preact';

import { RegistrationPasscode } from './RegistrationPasscode';
import { RenderMJML } from '../../testUtils';

export default {
	title: 'Email/Templates/RegistrationPasscode',
	component: RegistrationPasscode,
	parameters: {
		chromatic: {
			modes: {
				'dark desktop': { disable: true },
				'dark mobile': { disable: true },
			},
		},
	},
} as Meta;

export const Default = () => {
	return (
		<RenderMJML>
			<RegistrationPasscode />
		</RenderMJML>
	);
};
Default.storyName = 'with defaults';

export const Passcode = () => {
	return (
		<RenderMJML>
			<RegistrationPasscode storybookPasscode="123456" />
		</RenderMJML>
	);
};
Passcode.storyName = 'with passcode';
