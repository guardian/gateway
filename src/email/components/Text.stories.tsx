import type { Meta } from '@storybook/react';
import React from 'react';
import { renderMJMLComponent } from '../testUtils';
import { Text } from './Text';

export default {
	title: 'Email/Components/Text',
	component: Text,
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
	return renderMJMLComponent(
		<Text>
			Edward Snowden&apos;s choice of Hong Kong as haven is a high-stakes gamble
		</Text>,
	);
};
Default.storyName = 'Default text';
