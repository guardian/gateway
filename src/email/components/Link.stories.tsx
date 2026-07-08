import React from 'react';
import { Meta } from '@storybook/preact';

import { Text } from './Text';
import { Link } from './Link';
import { RenderMJML } from '../testUtils';

export default {
	title: 'Email/Components/Link',
	component: Link,
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
				For more information <Link href="/">click here</Link>
			</Text>
		</RenderMJML>
	);
};
Default.storyName = 'Default link';
