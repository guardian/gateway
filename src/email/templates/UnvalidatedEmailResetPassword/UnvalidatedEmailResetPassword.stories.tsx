import type { Meta } from '@storybook/react';
import React from 'react';
import { renderMJML } from '../../testUtils';
import { UnvalidatedEmailResetPassword } from './UnvalidatedEmailResetPassword';

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
	return renderMJML(<UnvalidatedEmailResetPassword />);
};
Default.storyName = 'with defaults';
