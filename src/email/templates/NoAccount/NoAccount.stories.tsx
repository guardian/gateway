import React from 'react';
import { Meta } from '@storybook/preact';

import { NoAccount } from './NoAccount';
import { RenderMJML } from '../../testUtils';

export default {
	title: 'Email/Templates/NoAccount',
	component: NoAccount,
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
			<NoAccount />
		</RenderMJML>
	);
};
Default.storyName = 'with defaults';
