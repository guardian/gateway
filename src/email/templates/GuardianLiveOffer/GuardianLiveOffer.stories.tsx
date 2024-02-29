import React from 'react';
import { Meta } from '@storybook/react';

import { GuardianLiveOffer } from './GuardianLiveOffer';
import { renderMJML } from '../../testUtils';

export default {
	title: 'Email/Templates/GuardianLiveOffer',
	component: GuardianLiveOffer,
	parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => {
	return renderMJML(<GuardianLiveOffer />);
};
Default.storyName = 'with defaults';
