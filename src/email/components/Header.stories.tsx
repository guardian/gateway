import React from 'react';
import { Meta } from '@storybook/react';

import { Header } from './Header';
import { renderMJMLComponent } from '../testUtils';

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
	return renderMJMLComponent(<Header />);
};
Default.storyName = 'Default header';
