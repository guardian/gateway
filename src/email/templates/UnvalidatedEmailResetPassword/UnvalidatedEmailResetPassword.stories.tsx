import React from 'react';
import { Meta } from '@storybook/preact';

import { UnvalidatedEmailResetPassword } from './UnvalidatedEmailResetPassword';
import { RenderMJML } from '../../testUtils';

export default {
	title: 'Email/Templates/UnvalidatedEmailResetPassword',
	component: UnvalidatedEmailResetPassword,
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
			<UnvalidatedEmailResetPassword />
		</RenderMJML>
	);
};
Default.storyName = 'with defaults';
