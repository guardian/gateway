import React from 'react';
import { Meta } from '@storybook/preact';

import { Text } from './Text';
import { RenderMJML } from '../testUtils';

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
	return (
		<RenderMJML wrap={true}>
			<Text>
				Edward Snowden&apos;s choice of Hong Kong as haven is a high-stakes
				gamble
			</Text>
		</RenderMJML>
	);
};
Default.storyName = 'Default text';
