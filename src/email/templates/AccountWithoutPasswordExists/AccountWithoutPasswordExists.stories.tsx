import type { Meta } from '@storybook/react';
import React from 'react';
import { renderMJML } from '../../testUtils';
import { AccountWithoutPasswordExists } from './AccountWithoutPasswordExists';

export default {
	title: 'Email/Templates/AccountWithoutPasswordExists',
	component: AccountWithoutPasswordExists,
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
	return renderMJML(<AccountWithoutPasswordExists />);
};
Default.storyName = 'with defaults';
