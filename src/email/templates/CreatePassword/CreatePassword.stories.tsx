import React from 'react';
import { Meta } from '@storybook/preact';

import { CreatePassword } from './CreatePassword';
import { RenderMJML } from '../../testUtils';

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
	return (
		<RenderMJML>
			<CreatePassword />
		</RenderMJML>
	);
};
Default.storyName = 'with defaults';
