import type { Meta } from '@storybook/react';
import React from 'react';
import { renderMJML } from '../../testUtils';
import { AccountExists } from './AccountExists';

export default {
	title: 'Email/Templates/AccountExists',
	component: AccountExists,
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
	return renderMJML(<AccountExists />);
};
Default.storyName = 'with defaults';
