import type { Meta } from '@storybook/react';
import React from 'react';
import { renderMJML } from '../../testUtils';
import { AccidentalEmail } from './AccidentalEmail';

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
	return renderMJML(<AccidentalEmail />);
};
Default.storyName = 'with defaults';
