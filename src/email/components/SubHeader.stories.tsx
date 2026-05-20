import React from 'react';
import { Meta } from '@storybook/preact';

import { SubHeader } from './SubHeader';
import { RenderMJML } from '../testUtils';

export default {
	title: 'Email/Components/SubHeader',
	component: SubHeader,
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
			<SubHeader>My subheader text</SubHeader>
		</RenderMJML>
	);
};
Default.storyName = 'Default sub header';
