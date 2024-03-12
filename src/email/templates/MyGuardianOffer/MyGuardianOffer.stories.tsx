import React from 'react';
import { Meta } from '@storybook/react';

import { MyGuardianOffer } from './MyGuardianOffer';
import { renderMJML } from '../../testUtils';

export default {
	title: 'Email/Templates/MyGuardianOffer',
	component: MyGuardianOffer,
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
	return renderMJML(<MyGuardianOffer />);
};
Default.storyName = 'with defaults';
