import React from 'react';
import { Meta } from '@storybook/react';

import { Button } from './Button';
import { renderMJMLComponent } from '../testUtils';

export default {
	title: 'Email/Components/Button',
	component: Button,
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
	return renderMJMLComponent(<Button href="">Test Email Button</Button>);
};
Default.storyName = 'Default email button';
