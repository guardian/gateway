import React from 'react';
import { Meta } from '@storybook/preact';

import { EmailChallengePasscode } from './EmailChallengePasscode';
import { RenderMJML } from '../../testUtils';

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
	return (
		<RenderMJML>
			<EmailChallengePasscode />
		</RenderMJML>
	);
};
Default.storyName = 'with defaults';

export const Passcode = () => {
	return (
		<RenderMJML>
			<EmailChallengePasscode storybookPasscode="123456" />
		</RenderMJML>
	);
};
Passcode.storyName = 'with passcode';
