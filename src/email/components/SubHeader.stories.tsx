import React from 'react';
import { Meta } from '@storybook/react';

import { SubHeader } from './SubHeader';
import { renderMJMLComponent } from '../testUtils';

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
