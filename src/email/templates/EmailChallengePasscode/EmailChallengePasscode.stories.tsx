import React from 'react';
import { Meta } from '@storybook/react';

import { EmailChallengePasscode } from './EmailChallengePasscode';
import { renderMJML } from '../../testUtils';

export default {
	title: 'Email/Templates/EmailChallengePasscode',
	component: EmailChallengePasscode,
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
	return renderMJML(<EmailChallengePasscode />);
};
Default.storyName = 'with defaults';

export const Passcode = () => {
	return renderMJML(<EmailChallengePasscode storybookPasscode="123456" />);
};
Passcode.storyName = 'with passcode';
