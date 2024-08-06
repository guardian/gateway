import type { Meta } from '@storybook/react';
import React from 'react';
import { renderMJML } from '../../testUtils';
import { ResetPassword } from './ResetPassword';

export default {
	title: 'Email/Templates/ResetPassword',
	component: ResetPassword,
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
	return renderMJML(<ResetPassword />);
};
Default.storyName = 'with defaults';
