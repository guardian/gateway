import React from 'react';
import { Meta } from '@storybook/react';

import { GuardianLiveOffer } from './GuardianLiveOffer';
import { renderMJML } from '../../testUtils';

export default {
	title: 'Email/Templates/GuardianLiveOffer',
	component: GuardianLiveOffer,
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
	return renderMJML(<GuardianLiveOffer />);
};
Default.storyName = 'with defaults';
