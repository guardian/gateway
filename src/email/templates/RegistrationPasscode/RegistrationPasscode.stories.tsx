import type { Meta } from '@storybook/react';
import React from 'react';
import { renderMJML } from '../../testUtils';
import { RegistrationPasscode } from './RegistrationPasscode';

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
	return renderMJML(<RegistrationPasscode />);
};
Default.storyName = 'with defaults';

export const Passcode = () => {
	return renderMJML(<RegistrationPasscode storybookPasscode="123456" />);
};
Passcode.storyName = 'with passcode';
