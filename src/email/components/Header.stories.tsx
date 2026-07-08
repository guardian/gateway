import React from 'react';
import { Meta } from '@storybook/preact';

import { Header } from './Header';
import { RenderMJML } from '../testUtils';

export default {
	title: 'Email/Components/Header',
	component: Header,
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
			<Header />
		</RenderMJML>
	);
};
Default.storyName = 'Default header';
