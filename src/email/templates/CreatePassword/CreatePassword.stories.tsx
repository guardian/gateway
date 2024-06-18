import React from 'react';
import { Meta } from '@storybook/react';

import { CreatePassword } from './CreatePassword';
import { renderMJML } from '../../testUtils';

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
