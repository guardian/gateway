import React from 'react';
import { Meta } from '@storybook/preact';

import { AccountWithoutPasswordExists } from './AccountWithoutPasswordExists';
import { RenderMJML } from '../../testUtils';

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
	return (
		<RenderMJML>
			<AccountWithoutPasswordExists />
		</RenderMJML>
	);
};
Default.storyName = 'with defaults';
