import React from 'react';
import { Meta } from '@storybook/preact';

import { ResetPassword } from './ResetPassword';
import { RenderMJML } from '../../testUtils';

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
	return (
		<RenderMJML>
			<ResetPassword />
		</RenderMJML>
	);
};
Default.storyName = 'with defaults';
