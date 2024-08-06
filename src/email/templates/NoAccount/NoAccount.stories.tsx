import type { Meta } from '@storybook/react';
import React from 'react';
import { renderMJML } from '../../testUtils';
import { NoAccount } from './NoAccount';

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
	return renderMJML(<NoAccount />);
};
Default.storyName = 'with defaults';
