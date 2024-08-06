import type { Meta } from '@storybook/react';
import React from 'react';
import { renderMJML } from '../../testUtils';
import { CreatePassword } from './CreatePassword';

export default {
	title: 'Email/Templates/CreatePassword',
	component: CreatePassword,
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
	return renderMJML(<CreatePassword />);
};
Default.storyName = 'with defaults';
