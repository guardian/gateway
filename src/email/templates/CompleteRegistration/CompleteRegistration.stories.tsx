import React from 'react';
import { Meta } from '@storybook/preact';

import { CompleteRegistration } from './CompleteRegistration';
import { RenderMJML } from '../../testUtils';

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
	return (
		<RenderMJML>
			<CompleteRegistration />
		</RenderMJML>
	);
};
Default.storyName = 'with defaults';
