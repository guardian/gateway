import React from 'react';
import { Meta } from '@storybook/react';

import { NoAccount } from './NoAccount';
import { renderMJML } from '../../testUtils';

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
