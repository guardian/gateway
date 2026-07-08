import React from 'react';
import { Meta } from '@storybook/preact';

import { Button } from './Button';
import { RenderMJML } from '../testUtils';

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
	return (
		<RenderMJML wrap={true}>
			<Button href="">Test Email Button</Button>
		</RenderMJML>
	);
};
Default.storyName = 'Default email button';
