import React from 'react';
import { Meta } from '@storybook/preact';

import { AccidentalEmail } from './AccidentalEmail';
import { RenderMJML } from '../../testUtils';

export default {
	title: 'Email/Templates/AccidentalEmail',
	component: AccidentalEmail,
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
			<AccidentalEmail />
		</RenderMJML>
	);
};
Default.storyName = 'with defaults';
