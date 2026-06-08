import React from 'react';
import { Meta } from '@storybook/preact';

import { AccountExists } from './AccountExists';
import { RenderMJML } from '../../testUtils';

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
	return (
		<RenderMJML>
			<AccountExists />
		</RenderMJML>
	);
};
Default.storyName = 'with defaults';
