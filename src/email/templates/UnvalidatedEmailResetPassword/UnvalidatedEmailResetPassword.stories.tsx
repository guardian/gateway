import React from 'react';
import { Meta } from '@storybook/preact';

import { UnvalidatedEmailResetPassword } from './UnvalidatedEmailResetPassword';
import { renderMJML } from '../../testUtils';

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
