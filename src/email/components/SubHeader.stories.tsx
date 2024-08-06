import type { Meta } from '@storybook/react';
import React from 'react';
import { renderMJMLComponent } from '../testUtils';
import { SubHeader } from './SubHeader';

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
	return renderMJMLComponent(<SubHeader>My subheader text</SubHeader>);
};
Default.storyName = 'Default sub header';
