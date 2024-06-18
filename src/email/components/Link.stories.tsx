import React from 'react';
import { Meta } from '@storybook/react';

import { Text } from './Text';
import { Link } from './Link';
import { renderMJMLComponent } from '../testUtils';

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
	return renderMJMLComponent(
		<Text>
			For more information <Link href="/">click here</Link>
		</Text>,
	);
};
Default.storyName = 'Default link';
