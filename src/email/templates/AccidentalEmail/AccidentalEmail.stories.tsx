import React from 'react';
import { Meta } from '@storybook/react';

import { AccidentalEmail } from './AccidentalEmail';
import { renderMJML } from '../../testUtils';

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
