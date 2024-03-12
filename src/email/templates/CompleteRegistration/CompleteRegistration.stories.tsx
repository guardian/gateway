import React from 'react';
import { Meta } from '@storybook/react';

import { CompleteRegistration } from './CompleteRegistration';
import { renderMJML } from '../../testUtils';

export default {
	title: 'Email/Templates/CompleteRegistration',
	component: CompleteRegistration,
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
	return renderMJML(<CompleteRegistration />);
};
Default.storyName = 'with defaults';
